using MediatR;
using System;

namespace Application.Features.ScrappingManager.Queries
{
    public class GetScrappingReportRequest
        : IRequest<GetScrappingReportResult>
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string ProductId { get; set; }
        public bool? IsDeleted { get; set; }
        public string WarehouseId { get; set; }

    }
}
