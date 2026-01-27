using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class IssueRequests : BaseEntity
{
    public string? Number { get; set; }
    public DateTime? OrderDate { get; set; }
    public SalesOrderStatus? OrderStatus { get; set; }
    public string? Description { get; set; }
    public string? EmployeeId { get; set; }
    public string? WarehouseId { get; set; }
    public Employee? Employee { get; set; }
    public string? TaxId { get; set; }
    public Tax? Tax { get; set; }
    public double? BeforeTaxAmount { get; set; }
    public double? TaxAmount { get; set; }
    public double? AfterTaxAmount { get; set; }
    public ICollection<IssueRequestsItem> IssueRequestsItemList { get; set; } = new List<IssueRequestsItem>();
}
