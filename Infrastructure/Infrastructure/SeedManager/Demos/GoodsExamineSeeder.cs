using Application.Common.Repositories;
using Application.Features.InventoryTransactionManager;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.SeedManager.Demos;

public class GoodsExamineSeeder
{
    private readonly ICommandRepository<GoodsExamine> _GoodsExamineRepository;
    private readonly ICommandRepository<PurchaseOrder> _purchaseOrderRepository;
    private readonly ICommandRepository<PurchaseOrderItem> _purchaseOrderItemRepository;
    private readonly ICommandRepository<Warehouse> _warehouseRepository;
    private readonly ICommandRepository<InventoryTransaction> _inventoryTransactionRepository;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly IUnitOfWork _unitOfWork;

    public GoodsExamineSeeder(
        ICommandRepository<GoodsExamine> GoodsExamineRepository,
        ICommandRepository<PurchaseOrder> purchaseOrderRepository,
        ICommandRepository<PurchaseOrderItem> purchaseOrderItemRepository,
        ICommandRepository<Warehouse> warehouseRepository,
        ICommandRepository<InventoryTransaction> inventoryTransactionRepository,
        NumberSequenceService numberSequenceService,
        InventoryTransactionService inventoryTransactionService,
        IUnitOfWork unitOfWork
    )
    {
        _GoodsExamineRepository = GoodsExamineRepository;
        _purchaseOrderRepository = purchaseOrderRepository;
        _purchaseOrderItemRepository = purchaseOrderItemRepository;
        _warehouseRepository = warehouseRepository;
        _inventoryTransactionRepository = inventoryTransactionRepository;
        _numberSequenceService = numberSequenceService;
        _inventoryTransactionService = inventoryTransactionService;
        _unitOfWork = unitOfWork;
    }

    public async Task GenerateDataAsync()
    {
        var random = new Random();
        var GoodsExamineStatusLength = Enum.GetNames(typeof(GoodsExamineStatus)).Length;

        var purchaseOrders = await _purchaseOrderRepository
            .GetQuery()
            .Where(x => x.OrderStatus >= PurchaseOrderStatus.Confirmed)
            .ToListAsync();

        var warehouses = await _warehouseRepository
            .GetQuery()
            .Where(x => x.SystemWarehouse == false)
            .Select(x => x.Id)
            .ToListAsync();

        foreach (var purchaseOrder in purchaseOrders)
        {
            var goodsExamine = new GoodsExamine
            {
                Number = _numberSequenceService.GenerateNumber(nameof(GoodsExamine), "", "GE"),
                ExamineDate = purchaseOrder.OrderDate?.AddDays(random.Next(1, 5)),
                Status = (GoodsExamineStatus)random.Next(0, GoodsExamineStatusLength),
                PurchaseOrderId = purchaseOrder.Id,
            };
            await _GoodsExamineRepository.CreateAsync(goodsExamine);

            var items = await _purchaseOrderItemRepository
                .GetQuery()
                .Include(x => x.Product)
                .Where(x => x.PurchaseOrderId == purchaseOrder.Id && x.Product!.Physical == true)
                .ToListAsync();

            

            await _unitOfWork.SaveAsync();
        }
    }


    
}
