using Application.Common.CQS.Queries;
using Application.Common.Services;
using Application.Features.ScrappingManager.Queries;
using Application.Features.ScrappingManager.Queries.Application.Features.ScrappingManager.Queries;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.ScrappingManager.Queries
{
    public class GetScrappingReportHandler
        : IRequestHandler<GetScrappingReportRequest, GetScrappingReportResult>
    {
        private readonly IMapper _mapper;
        private readonly IQueryContext _context;

        public GetScrappingReportHandler(
            IMapper mapper,
            IQueryContext context)
        {
            _mapper = mapper;
            _context = context;
        }

        public async Task<GetScrappingReportResult> Handle(
     GetScrappingReportRequest request,
     CancellationToken cancellationToken)
        {
            var query =
                from s in _context.Scrapping.AsNoTracking()
                join it in _context.InventoryTransaction.AsNoTracking()
                    on s.Id equals it.ModuleId
                join p in _context.Product.AsNoTracking()
                    on it.ProductId equals p.Id
                join w in _context.Warehouse.AsNoTracking()
                    on s.WarehouseId equals w.Id
                join u in _context.UnitMeasure.AsNoTracking()
                    on p.UnitMeasureId equals u.Id into unit
                from u in unit.DefaultIfEmpty()
                where it.ModuleName == "Scrapping"
                select new { s, it, p, w, u };

            // IsDeleted
            if (request.IsDeleted.HasValue)
                query = query.Where(x => x.s.IsDeleted == request.IsDeleted);

            // Date Filter
            if (request.FromDate.HasValue)
                query = query.Where(x => x.s.ScrappingDate >= request.FromDate);

            if (request.ToDate.HasValue)
                query = query.Where(x => x.s.ScrappingDate <= request.ToDate);

            // Warehouse Filter
            if (!string.IsNullOrEmpty(request.WarehouseId))
                query = query.Where(x => x.s.WarehouseId == request.WarehouseId);

            // Product Filter
            if (!string.IsNullOrEmpty(request.ProductId))
                query = query.Where(x => x.p.Id == request.ProductId);

            var entities = await query
                .Select(x => new ScrappingReportDto
                {
                    ScrappingNumber = x.s.Number,
                    ScrappingDate = x.s.ScrappingDate.Value,
                    WarehouseName = x.w.Name,
                    ProductCode = x.p.Number,
                    ProductName = x.p.Name,
                    UnitName = x.u.Name,
                    Quantity = decimal.Abs((decimal)(x.it.Movement ?? 0)),
                    Notes = x.s.Description
                })
                .OrderBy(x => x.ScrappingDate)
                .ToListAsync(cancellationToken);

            return new GetScrappingReportResult
            {
                Data = entities
            };
        }

    }
}
