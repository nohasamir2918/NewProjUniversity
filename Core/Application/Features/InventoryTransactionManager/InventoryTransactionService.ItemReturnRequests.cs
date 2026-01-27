using Application.Common.Extensions;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace Application.Features.InventoryTransactionManager;


public partial class InventoryTransactionService
{
    private const string ItemReturnWarehouseToId = "8c669421-868c-4d3c-9718-b3b10422c05a"; // كهنة و مستعمل


    public async Task<InventoryTransaction> ItemReturnRequestCreateInvenTrans(
        string? moduleId,
        string? productId,
        double? movement,
        string? createdById,
        CancellationToken cancellationToken = default
    )
    {
        var parent = await _queryContext
            .ItemReturnRequests
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == moduleId, cancellationToken);

        if (parent == null)
        {
            throw new Exception($"Parent ItemReturnRequests not found: {moduleId}");
        }

        var previousIrTrans = await _queryContext.InventoryTransaction
            .AsNoTracking()
            .Where(t => t.ModuleName == "IR" && t.ProductId == productId && !t.IsDeleted)
            .OrderByDescending(t => t.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        var warehouseFromId = previousIrTrans?.WarehouseToId; 

        var child = new InventoryTransaction();
        child.CreatedById = createdById;

        child.Number = _numberSequenceService.GenerateNumber(nameof(InventoryTransaction), "", "IVT");
        child.ModuleId = parent.Id;
        child.ModuleName = "IRR";          // as requested
        child.ModuleCode = "IRR";
        child.ModuleNumber = parent.Number;
        child.MovementDate = parent.OrderDate ?? DateTime.UtcNow;
        child.Status = InventoryTransactionStatus.Confirmed;

        // Set WarehouseFrom to the warehouseTo of the IR transaction (if found)
        child.WarehouseId = warehouseFromId;
        child.WarehouseFromId = warehouseFromId;

        //  (كهنة و مستعمل)
        child.WarehouseToId = ItemReturnWarehouseToId;
        child.ProductId = productId;
        child.Movement = movement;

       
        ItemReturnRequestProcessing(child);

        await _inventoryTransactionRepository.CreateAsync(child, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        return child;
    }


    private InventoryTransaction ItemReturnRequestProcessing(InventoryTransaction transaction)
    {
        if (transaction == null)
        {
            throw new Exception("Inventory transaction is null");
        }

  
        transaction.TransType = InventoryTransType.In;
        CalculateStock(transaction); 

      
        if (string.IsNullOrEmpty(transaction.WarehouseFromId))
        {
            // fallback: if no source found, use transfer warehouse (or leave null)
            transaction.WarehouseFromId = _warehouseService.GetTransferWarehouse()?.Id;
        }

        if (string.IsNullOrEmpty(transaction.WarehouseToId))
        {
            transaction.WarehouseToId = ItemReturnWarehouseToId;
        }

        // Keep WarehouseId consistent with WarehouseFrom (this matches other processing patterns)
        transaction.WarehouseId = transaction.WarehouseFromId;

        return transaction;
    }
}