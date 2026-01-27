using Application.Common.Repositories;
using Application.Features.InventoryTransactionManager;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;

namespace Application.Features.ItemReturnRequestsManager.Commands;

public class CreateItemReturnRequestsResult
{
    public ItemReturnRequests? Data { get; set; }
}

public class CreateItemReturnRequestsRequest : IRequest<CreateItemReturnRequestsResult>
{
    public DateTime? OrderDate { get; init; }
    public string? OrderStatus { get; init; }
    public string? CommitteeDecision { get; set; }
    public string? EmployeeId { get; set; }
    public string? ProductId { get; set; }
    public string? ProductStatus { get; set; }
    public double? UnitPrice { get; set; } = 0;
    public double? Quantity { get; set; }
    public string? CreatedById { get; init; }
}

public class CreateItemReturnRequestsValidator : AbstractValidator<CreateItemReturnRequestsRequest>
{
    public CreateItemReturnRequestsValidator()
    {
        RuleFor(x => x.OrderDate).NotEmpty();
        RuleFor(x => x.OrderStatus).NotEmpty();
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.EmployeeId).NotEmpty();
    }
}

public class CreateItemReturnRequestsHandler : IRequestHandler<CreateItemReturnRequestsRequest, CreateItemReturnRequestsResult>
{
    private readonly ICommandRepository<ItemReturnRequests> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly ItemReturnRequestsService _ItemReturnRequestsService;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ICommandRepository<GoodsReceive> _goodsReceiveRepository;

    public CreateItemReturnRequestsHandler(
        ICommandRepository<ItemReturnRequests> repository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        ItemReturnRequestsService ItemReturnRequestsService,
        InventoryTransactionService inventoryTransactionService,
        ICommandRepository<GoodsReceive> goodsReceiveRepository
        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _ItemReturnRequestsService = ItemReturnRequestsService;
        _inventoryTransactionService = inventoryTransactionService;
        _goodsReceiveRepository = goodsReceiveRepository;
    }

    public async Task<CreateItemReturnRequestsResult> Handle(CreateItemReturnRequestsRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new ItemReturnRequests();
        entity.CreatedById = request.CreatedById;

        entity.Number = _numberSequenceService.GenerateNumber(nameof(ItemReturnRequests), "", "ITR");
        entity.OrderDate = request.OrderDate;
        entity.OrderStatus = (SalesOrderStatus)int.Parse(request.OrderStatus!);
        entity.CommitteeDecision = request.CommitteeDecision;
        entity.ProductId = request.ProductId;
        entity.ProductStatus = request.ProductStatus; 
        entity.EmployeeId = request.EmployeeId;
        entity.Quantity = request.Quantity;
        entity.UnitPrice = request.UnitPrice;

        await _repository.CreateAsync(entity, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        _ItemReturnRequestsService.Recalculate(entity.Id);


        // --- create corresponding GoodsReceive (as a return) and inventory trans ---
       
            var gr = new GoodsReceive();
            gr.CreatedById = request.CreatedById;
            gr.Number = _numberSequenceService.GenerateNumber(nameof(ItemReturnRequests), "", "IRR");
            gr.ReceiveDate = request.OrderDate ?? DateTime.UtcNow;
            gr.Status = GoodsReceiveStatus.Confirmed;
            gr.Description = $"Return from ItemReturnRequest {entity.Number}";
            gr.PurchaseOrderId = null;
            gr.ReturnRequestId = entity.Id;
            gr.TransType = 2; // 2 = ReturnRequest

            await _goodsReceiveRepository.CreateAsync(gr, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            // create a single inventory transaction for this ItemReturnRequests (module = "IRR")
           
                if (!string.IsNullOrEmpty(entity.ProductId) && (entity.Quantity ?? 0) > 0)
                {
                    await _inventoryTransactionService.ItemReturnRequestCreateInvenTrans(
                        entity.Id,                
                        entity.ProductId,
                        entity.Quantity,
                        entity.CreatedById,
                        cancellationToken
                    );
                }
          
        
     


        return new CreateItemReturnRequestsResult
        {
            Data = entity
        };
    }
}