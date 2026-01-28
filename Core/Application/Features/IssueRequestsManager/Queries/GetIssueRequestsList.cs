using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.IssueRequestsManager.Queries;

public record GetIssueRequestsListDto
{
    public string? Id { get; init; }
    public string? Number { get; init; }
    public DateTime? OrderDate { get; init; }
    public IssueRequestsStatus? OrderStatus { get; init; }
    public string? OrderStatusName { get; init; }
    public string? Description { get; init; }
    public string? EmployeeId { get; init; }
    public string? EmployeeName { get; init; }
    public string? WarehouseId { get; init; }
    public string? WarehouseName { get; init; }
    public string? DepartmentId { get; init; }
    public string? DepartmentName { get; init; }
    public string? TaxId { get; init; }
    public string? TaxName { get; init; }
    public double? BeforeTaxAmount { get; init; }
    public double? TaxAmount { get; init; }
    public double? AfterTaxAmount { get; init; }
    public DateTime? CreatedAtUtc { get; init; }
}

public class GetIssueRequestsListProfile : Profile
{
    public GetIssueRequestsListProfile()
    {
        CreateMap<IssueRequests, GetIssueRequestsListDto>()
        .ForMember(dest => dest.EmployeeId,
            opt => opt.MapFrom(src => src.EmployeeId))

        .ForMember(dest => dest.EmployeeName,
            opt => opt.MapFrom(src =>
                src.Employee != null ? src.Employee.Name : string.Empty))

        .ForMember(dest => dest.DepartmentId,
            opt => opt.MapFrom(src =>
                src.Employee != null
                    ? src.Employee.DepartmentId.ToString()
                    : null))

        .ForMember(dest => dest.DepartmentName,
            opt => opt.MapFrom(src =>
                src.Employee != null && src.Employee.Department != null
                    ? src.Employee.Department.Name
                    : string.Empty))

         .ForMember(dest => dest.WarehouseId,
            opt => opt.MapFrom(src => src.WarehouseId))

        //.ForMember(dest => dest.WarehouseName,
        //    opt => opt.MapFrom(src =>
        //        src.Warehouse != null ? src.Warehouse.Name : string.Empty))

        .ForMember(dest => dest.OrderStatusName,
            opt => opt.MapFrom(src =>
                src.OrderStatus.HasValue
                    ? src.OrderStatus.Value.ToFriendlyName()
                    : string.Empty));







    }
}

public class GetIssueRequestsListResult
{
    public List<GetIssueRequestsListDto>? Data { get; init; }
}

public class GetIssueRequestsListRequest : IRequest<GetIssueRequestsListResult>
{
    public bool IsDeleted { get; init; } = false;
}


public class GetIssueRequestsListHandler : IRequestHandler<GetIssueRequestsListRequest, GetIssueRequestsListResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public GetIssueRequestsListHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<GetIssueRequestsListResult> Handle(GetIssueRequestsListRequest request, CancellationToken cancellationToken)
    {
        var query = _context
            .IssueRequests
            .AsNoTracking()
            .ApplyIsDeletedFilter(request.IsDeleted)
            .Include(x => x.Employee)
            .ThenInclude(e => e.Department)
          
            .AsQueryable();

        var entities = await query.ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<GetIssueRequestsListDto>>(entities);

        return new GetIssueRequestsListResult
        {
            Data = dtos
        };
    }


}



