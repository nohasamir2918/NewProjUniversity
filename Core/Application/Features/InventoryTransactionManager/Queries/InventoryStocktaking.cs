using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.InventoryTransactionManager.Queries;


public record InventoryStocktakingDto
{
    public string? Number { get; init; }
    public string? Name { get; init; }

    public double? Quantity { get; init; }

    public double? UnitPrice { get; set; }
    public string? UnitMeasureName { get; set; }


}


public class InventoryStocktakingProfile : Profile
{
    public InventoryStocktakingProfile()
    {
    }
}

public class InventoryStocktakingResult
{
    public List<InventoryStocktakingDto>? Data { get; init; }
}

public class InventoryStocktakingRequest : IRequest<InventoryStocktakingResult>
{
    public string? WarehouseId { get; set; }
    public bool IsDeleted { get; init; } = false;
}


public class InventoryStocktakingHandler : IRequestHandler<InventoryStocktakingRequest, InventoryStocktakingResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public InventoryStocktakingHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }


    public async Task<InventoryStocktakingResult> Handle(
     InventoryStocktakingRequest request,
     CancellationToken cancellationToken)
    {
        var query =
            from it in _context.InventoryTransaction
                .AsNoTracking()
                .ApplyIsDeletedFilter(request.IsDeleted)

            join p in _context.Product
             on it.ProductId equals p.Id

            // left join to UnitMeasure so we can access UnitMeasure.Name in the grouped result
            join um in _context.UnitMeasure
                on p.UnitMeasureId equals um.Id into umJoin
            from um in umJoin.DefaultIfEmpty()


            select new
            {
                it,
                p,
                um,
            };

        if (request.WarehouseId != null)
        {
            query = query.Where(x =>
                (x.it.ModuleName == "GoodsReceive" && x.it.WarehouseToId == request.WarehouseId)
                || (x.it.ModuleName == "IssueRequests" && x.it.WarehouseFromId == request.WarehouseId)
            );
        }

       
        var entities = await query
            .GroupBy(x => new
            {
                x.p.Id,
                x.p.Name,
                x.p.UnitPrice,
                UnitMeasureName = x.um != null ? x.um.Name : null
            })
            .Select(g => new InventoryStocktakingDto
            {
                Number = g.Key.Id,
                Name = g.Key.Name,
                Quantity = g.Sum(x => x.it.Stock),
                UnitPrice = g.Key.UnitPrice,
                UnitMeasureName = g.Key.UnitMeasureName
            })
            .ToListAsync(cancellationToken);

        return new InventoryStocktakingResult
        {
            Data = entities
        };
    }


}



