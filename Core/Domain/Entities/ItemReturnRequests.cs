using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class ItemReturnRequests : BaseEntity
{
    public string? Number { get; set; }
    public DateTime? OrderDate { get; set; }
    public SalesOrderStatus? OrderStatus { get; set; }
    public string? CommitteeDecision { get; set; }
    public string? EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    public string? ProductId { get; set; }
    public string? ProductStatus { get; set; }
    public Product? Product { get; set; }
    public double? UnitPrice { get; set; } = 0;
    public double? Quantity { get; set; }
    
}
