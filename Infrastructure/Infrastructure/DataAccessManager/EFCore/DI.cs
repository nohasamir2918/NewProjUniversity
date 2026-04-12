using Application.Common.CQS.Commands;
using Application.Common.CQS.Queries;
using Application.Common.Repositories;
using Infrastructure.DataAccessManager.EFCore.Contexts;
using Infrastructure.DataAccessManager.EFCore.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;

namespace Infrastructure.DataAccessManager.EFCore;



public static class DI
{
    public static IServiceCollection RegisterDataAccess(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        var databaseProvider = configuration["DatabaseProvider"];

        // 🔴 Debug step (مهم جدًا لمعرفة القيمة الحقيقية)
       //throw new Exception($"DatabaseProvider = {databaseProvider} | Connection = {connectionString}");

        switch (databaseProvider?.ToLower())
        {
            case "postgresql":
            case "postgres":

                services.AddDbContext<DataContext>(options =>
                    options.UseNpgsql(connectionString)
                    .LogTo(Log.Information, LogLevel.Information)
                    .EnableSensitiveDataLogging()
                );

                services.AddDbContext<CommandContext>(options =>
                    options.UseNpgsql(connectionString)
                    .LogTo(Log.Information, LogLevel.Information)
                    .EnableSensitiveDataLogging()
                );

                services.AddDbContext<QueryContext>(options =>
                    options.UseNpgsql(connectionString)
                    .LogTo(Log.Information, LogLevel.Information)
                    .EnableSensitiveDataLogging()
                );

                break;

            case "sqlserver":
            default:

                services.AddDbContext<DataContext>(options =>
                    options.UseNpgsql(connectionString)
                    .LogTo(Log.Information, LogLevel.Information)
                    .EnableSensitiveDataLogging()
                );

                services.AddDbContext<CommandContext>(options =>
                    options.UseNpgsql(connectionString)
                    .LogTo(Log.Information, LogLevel.Information)
                    .EnableSensitiveDataLogging()
                );

                services.AddDbContext<QueryContext>(options =>
                    options.UseNpgsql(connectionString)
                    .LogTo(Log.Information, LogLevel.Information)
                    .EnableSensitiveDataLogging()
                );

                break;
        }

        services.AddScoped<ICommandContext, CommandContext>();
        services.AddScoped<IQueryContext, QueryContext>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped(typeof(ICommandRepository<>), typeof(CommandRepository<>));

        return services;
    }
    public static IHost CreateDatabase(this IHost host)
    {
        using var scope = host.Services.CreateScope();
        var serviceProvider = scope.ServiceProvider;

        // Create database using DataContext
        var dataContext = serviceProvider.GetRequiredService<DataContext>();
        dataContext.Database.Migrate();
        //dataContext.Database.EnsureCreated(); // Ensure database is created (development only)

        return host;
    }
}


