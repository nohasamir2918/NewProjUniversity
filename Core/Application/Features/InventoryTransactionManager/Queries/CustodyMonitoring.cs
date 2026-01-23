using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.InventoryTransactionManager.Queries;


public record CustodyMonitoringDto
{
    public string? ModuleName { get; init; }
    public string? ModuleNumber { get; set; }
    public double? Movement { get; init; }

}


public class CustodyMonitoringProfile : Profile
{
    public CustodyMonitoringProfile()
    {
    }
}

public class CustodyMonitoringResult
{
    public List<CustodyMonitoringDto>? Data { get; init; }
}

public class CustodyMonitoringRequest : IRequest<CustodyMonitoringResult>
{
    public string? EmployeeId { get; set; }
    public string? ProductId { get; set; }
    public bool IsDeleted { get; init; } = false;
}


public class CustodyMonitoringHandler : IRequestHandler<CustodyMonitoringRequest, CustodyMonitoringResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public CustodyMonitoringHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    //public async Task<CustodyMonitoringResult> Handle(CustodyMonitoringRequest request, CancellationToken cancellationToken)
    //{
    //    var query = _context
    //        .InventoryTransaction
    //        .AsNoTracking()
    //        .ApplyIsDeletedFilter(request.IsDeleted)
    //        .Include(x => x.IssueRequests)
    //        .Include(x => x.ItemReturnRequest)
    //        .Where(x =>x.ProductId=request.ProductId)
    //        .Select(x => new CustodyMonitoringDto
    //        {
    //            ModuleName = x.ModuleName,
    //            ModuleNumber = x.ProductId,
    //            Movement = x.Movement,

    //        })
    //        .AsQueryable();

    //    var entities = await query.ToListAsync(cancellationToken);

    //    return new CustodyMonitoringResult
    //    {
    //        Data = entities
    //    };
    //}
    public async Task<CustodyMonitoringResult> Handle(
     CustodyMonitoringRequest request,
     CancellationToken cancellationToken)
    {
        var query =
            from it in _context.InventoryTransaction
                .AsNoTracking()
                .ApplyIsDeletedFilter(request.IsDeleted)

            join issue in _context.IssueRequests
                on it.ModuleId equals issue.Id into issueGroup
            from issue in issueGroup.DefaultIfEmpty()

            join ret in _context.ItemReturnRequests
                on it.ModuleId equals ret.Id into returnGroup
            from ret in returnGroup.DefaultIfEmpty()

            where it.ProductId == request.ProductId

            select new
            {
                it,
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

        var entities = await query
            .Select(x => new CustodyMonitoringDto
            {
                ModuleName = (x.it.ModuleName== "IssueRequests" ? "اذن صرف" : "اذن ارتجاع"),
                ModuleNumber = x.it.ModuleId,
                Movement = x.it.Movement
            })
            .ToListAsync(cancellationToken);

        return new CustodyMonitoringResult
        {
            Data = entities
        };
    }


}



