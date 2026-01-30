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

    public DateTime? MovementDate { get; set; }
    public double? Movement { get; init; }

    public string? WarehouseName { get; set; }

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

            join warehouseFrom in _context.Warehouse
                on it.WarehouseFromId equals warehouseFrom.Id into warehouseFromGroup
            from warehouseFrom in warehouseFromGroup.DefaultIfEmpty()

            join warehouseTo in _context.Warehouse
                on it.ModuleId equals warehouseTo.Id into warehouseToGroup
            from warehouseTo in warehouseToGroup.DefaultIfEmpty()

            where it.ProductId == request.ProductId

            select new
            {
                it,
                issue,
                ret,
                warehouseFrom,
                warehouseTo
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
                Movement = x.it.Movement,
                MovementDate=x.it.MovementDate,
                WarehouseName=(x.it.ModuleCode=="IR"? x.warehouseFrom.Name : x.warehouseTo.Name)
            })
            .OrderBy(x=>x.MovementDate)
            .ToListAsync(cancellationToken);

        return new CustodyMonitoringResult
        {
            Data = entities
        };
    }


}



