using Domain.Common;
using Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

public class GoodsReceive : BaseEntity
{
    public string? Number { get; set; }
    public DateTime? ReceiveDate { get; set; }
    public GoodsReceiveStatus? Status { get; set; }
    public string? Description { get; set; }
    public string? PurchaseOrderId { get; set; }
    public PurchaseOrder? PurchaseOrder { get; set; }
    public string? ReturnRequestId { get; set; }
    [ForeignKey(nameof(ReturnRequestId))]
    public ItemReturnRequests? ItemReturnRequests { get; set; }
    public int? TransType { get; set; }

    public string? WarehouseToId { get; set; }
    [ForeignKey(nameof(WarehouseToId))]
    public Warehouse? WarehouseTo { get; set; }

}
