using Application.Common.Extensions;
using Application.Common.Repositories;
using Application.Features.InventoryTransactionManager;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.GoodsReceiveManager.Commands;

public class CreateGoodsReceiveResult
{
    public GoodsReceive? Data { get; set; }
}

public class CreateGoodsReceiveRequest : IRequest<CreateGoodsReceiveResult>
{
    public DateTime? ReceiveDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? PurchaseOrderId { get; init; }
    public string? ReturnRequestId { get; init; }   // new
    public int? TransType { get; init; }            // new: 1 = PurchaseOrder, 2 = ReturnRequest
    public string? WarehouseId { get; init; }       // optionally choose warehouse
    public string? CreatedById { get; init; }
}

public class CreateGoodsReceiveValidator : AbstractValidator<CreateGoodsReceiveRequest>
{
    public CreateGoodsReceiveValidator()
    {
        RuleFor(x => x.ReceiveDate).NotEmpty();
        RuleFor(x => x.Status).NotEmpty();
        // either PurchaseOrderId or ReturnRequestId must be provided depending on TransType
    }
}

public class CreateGoodsReceiveHandler : IRequestHandler<CreateGoodsReceiveRequest, CreateGoodsReceiveResult>
{
    private readonly ICommandRepository<GoodsReceive> _deliveryOrderRepository;
    private readonly ICommandRepository<PurchaseOrderItem> _purchaseOrderItemRepository;
    private readonly ICommandRepository<ItemReturnRequests> _itemReturnRequestRepository; // new repo
    private readonly ICommandRepository<Warehouse> _warehouseRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly InventoryTransactionService _inventoryTransactionService;

    public CreateGoodsReceiveHandler(
        ICommandRepository<GoodsReceive> deliveryOrderRepository,
        ICommandRepository<PurchaseOrderItem> purchaseOrderItemRepository,
        ICommandRepository<ItemReturnRequests> itemReturnRequestRepository,
        ICommandRepository<Warehouse> warehouseRepository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        InventoryTransactionService inventoryTransactionService
        )
    {
        _deliveryOrderRepository = deliveryOrderRepository;
        _purchaseOrderItemRepository = purchaseOrderItemRepository;
        _itemReturnRequestRepository = itemReturnRequestRepository;
        _warehouseRepository = warehouseRepository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _inventoryTransactionService = inventoryTransactionService;
    }

    public async Task<CreateGoodsReceiveResult> Handle(CreateGoodsReceiveRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new GoodsReceive();
        entity.CreatedById = request.CreatedById;

        entity.Number = _numberSequenceService.GenerateNumber(nameof(GoodsReceive), "", "GR");
        entity.ReceiveDate = request.ReceiveDate;
        entity.Status = (GoodsReceiveStatus)int.Parse(request.Status!);
        entity.Description = request.Description;
        entity.PurchaseOrderId = request.PurchaseOrderId;
        entity.ReturnRequestId = request.ReturnRequestId;   // persist
        entity.TransType = request.TransType;               // persist (nullable int)

        await _deliveryOrderRepository.CreateAsync(entity, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        // choose warehouse: prefer provided WarehouseId, otherwise fallback to first non-system warehouse
        string? warehouseIdToUse = request.WarehouseId;
        if (string.IsNullOrEmpty(warehouseIdToUse))
        {
            var defaultWarehouse = await _warehouseRepository
                .GetQuery()
                .ApplyIsDeletedFilter(false)
                .Where(x => x.SystemWarehouse == true)
                .FirstOrDefaultAsync(cancellationToken);

            warehouseIdToUse = defaultWarehouse?.Id;
        }
        else
        {
            // validate provided id exists
            var wh = await _warehouseRepository.GetAsync(warehouseIdToUse, cancellationToken);
            if (wh == null) warehouseIdToUse = null;
        }

        if (!string.IsNullOrEmpty(warehouseIdToUse))
        {
            if (request.TransType == 2 && !string.IsNullOrEmpty(request.ReturnRequestId))
            {
                // Return request path: create inventory trans for the return request item(s)
                var returnReq = await _itemReturnRequestRepository.GetAsync(request.ReturnRequestId ?? string.Empty, cancellationToken);
                if (returnReq != null && !string.IsNullOrEmpty(returnReq.ProductId) && (returnReq.Quantity ?? 0) > 0)
                {
                    if (returnReq.ProductId != null)
                    {
                        // Movement should be positive (adding to stock)
                        await _inventoryTransactionService.GoodsReceiveCreateInvenTrans(
                            entity.Id,
                            warehouseIdToUse,
                            returnReq.ProductId,
                            returnReq.Quantity,
                            entity.CreatedById,
                            returnReq.Id,
                            cancellationToken
                        );
                    }
                }
            }
            else if (!string.IsNullOrEmpty(entity.PurchaseOrderId))
            {
                // Purchase order path: existing logic (only approved items)
                var items = await _purchaseOrderItemRepository
                    .GetQuery()
                    .ApplyIsDeletedFilter(false)
                    .Where(x =>
                        x.PurchaseOrderId == entity.PurchaseOrderId &&
                        x.ItemStatus == true        // only approved items
                    )
                    .Include(x => x.Product)
                    .ToListAsync(cancellationToken);

                foreach (var item in items)
                {
                    if (item?.Product?.Physical ?? false)
                    {
                        await _inventoryTransactionService.GoodsReceiveCreateInvenTrans(
                            entity.Id,
                            warehouseIdToUse,
                            item.ProductId,
                            item.Quantity,
                            entity.CreatedById,
                            item.Id,
                            cancellationToken
                        );
                    }
                }
            }
        }

        return new CreateGoodsReceiveResult
        {
            Data = entity
        };
    }
}