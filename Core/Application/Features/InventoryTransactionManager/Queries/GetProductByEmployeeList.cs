using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.InventoryTransactionManager.Queries;


public record GetProductByEmployeeListDto
{
    public string? Id { get; init; }
    public string? Name { get; init; }


}


public class GetProductByEmployeeListProfile : Profile
{
    public GetProductByEmployeeListProfile()
    {
    }
}

public class GetProductByEmployeeListResult
{
    public List<GetProductByEmployeeListDto>? Data { get; init; }
}

public class GetProductByEmployeeListRequest : IRequest<GetProductByEmployeeListResult>
{
    public string? EmployeeId { get; set; }
    public bool IsDeleted { get; init; } = false;
}


public class GetProductByEmployeeHandler : IRequestHandler<GetProductByEmployeeListRequest, GetProductByEmployeeListResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public GetProductByEmployeeHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }


    public async Task<GetProductByEmployeeListResult> Handle(
     GetProductByEmployeeListRequest request,
     CancellationToken cancellationToken)
    {
        var query =
            from it in _context.InventoryTransaction
                .AsNoTracking()
                .ApplyIsDeletedFilter(request.IsDeleted)

            join p in _context.Product
        on it.ProductId equals p.Id

            join issue in _context.IssueRequests
                on it.ModuleId equals issue.Id into issueGroup
            from issue in issueGroup.DefaultIfEmpty()

            join ret in _context.ItemReturnRequests
                on it.ModuleId equals ret.Id into returnGroup
            from ret in returnGroup.DefaultIfEmpty()

            select new
            {
                it,
                p,
                issue,
                ret
            };

        if (request.EmployeeId != null)
        {
            query = query.Where(x =>
                (x.issue != null && x.issue.EmployeeId == request.EmployeeId)
                || (x.ret != null && x.ret.EmployeeId == request.EmployeeId)
            );
        }

        //var entities = await query
        //    .Select(x => new GetProductByEmployeeListDto
        //    {
        //        Id = x.p.Id,
        //        Name = x.p.Name,

        //    })
        //    .ToListAsync(cancellationToken);
        var entities = await query
    .GroupBy(x => new { x.p.Id, x.p.Name })
    .Select(g => new GetProductByEmployeeListDto
    {
        Id = g.Key.Id,
        Name = g.Key.Name
    })
    .ToListAsync(cancellationToken);

        return new GetProductByEmployeeListResult
        {
            Data = entities
        };
    }


}



