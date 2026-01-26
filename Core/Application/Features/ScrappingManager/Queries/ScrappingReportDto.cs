using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Features.ScrappingManager.Queries
{
    using System;

    namespace Application.Features.ScrappingManager.Queries
    {
        public class ScrappingReportDto
        {
            public string ScrappingNumber { get; set; }
            public DateTime ScrappingDate { get; set; }
            public DateTime TransactionDate { get; set; }
            public string ModuleName { get; set; }
            public string WarehouseName { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string UnitName { get; set; }
            public decimal Quantity { get; set; }
            public string Notes { get; set; }
        }
    }

}
