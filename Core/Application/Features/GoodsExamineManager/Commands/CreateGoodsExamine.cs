using Application.Common.Extensions;
using Application.Common.Repositories;
using Application.Features.GoodsExamineManager.Commands;
using Application.Features.GoodsReceiveManager.Commands;
using Application.Features.InventoryTransactionManager;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;

namespace Application.Features.GoodsExamineManager.Commands;

public class CreateGoodsExamineResult
{
    public GoodsExamine? Data { get; set; }
}

public class CreateGoodsExamineRequest : IRequest<CreateGoodsExamineResult>
{
    public DateTime? ExamineDate { get; set; }
    public string? Status { get; set; }
    public string? Description { get; init; }
    public string? PurchaseOrderId { get; init; }
    public string? CreatedById { get; set; }
    public DateTime? CommiteeDate { get; set; }
    public string? CommitteeDesionNumber { get; set; }
    // ✅ إضافة بيانات اللجنة
    public List<ExamineCommiteeDto>? committeeList { get; init; }

}
public class ExamineCommiteeDto
{   public string? Id { get; init; }
    public int? EmployeeID { get; init; }
    public int? EmployeePositionID { get; init; }
    public string? EmployeeName { get; init; }
    public string? EmployeePositionName { get; init; }
    public bool? EmployeeType { get; init; }
    public string? Description { get; init; }
    public bool IsDeleted { get; set; } = false;
}

public class CreateGoodsExamineValidator : AbstractValidator<CreateGoodsExamineRequest>
{
    public CreateGoodsExamineValidator()
    {
        RuleFor(x => x.ExamineDate).NotEmpty();
        RuleFor(x => x.Status).NotEmpty();
        RuleFor(x => x.PurchaseOrderId).NotEmpty();
    }
}

public class CreateGoodsExamineHandler : IRequestHandler<CreateGoodsExamineRequest, CreateGoodsExamineResult>
{
    private readonly ICommandRepository<GoodsExamine> _deliveryOrderRepository;
    private readonly ICommandRepository<PurchaseOrderItem> _purchaseOrderItemRepository;
    private readonly ICommandRepository<Warehouse> _warehouseRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ICommandRepository<ExamineCommitee> _examineCommiteeRepository;

    public CreateGoodsExamineHandler(
        ICommandRepository<GoodsExamine> deliveryOrderRepository,
        ICommandRepository<PurchaseOrderItem> purchaseOrderItemRepository,
        ICommandRepository<Warehouse> warehouseRepository,
        IUnitOfWork unitOfWork,
        ICommandRepository<ExamineCommitee> examineCommiteeRepository,
        NumberSequenceService numberSequenceService,
        InventoryTransactionService inventoryTransactionService
        )
    {
         _examineCommiteeRepository = examineCommiteeRepository; 
        _deliveryOrderRepository = deliveryOrderRepository;
        _purchaseOrderItemRepository = purchaseOrderItemRepository;
        _warehouseRepository = warehouseRepository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _inventoryTransactionService = inventoryTransactionService;
    }

    public async Task<CreateGoodsExamineResult> Handle(CreateGoodsExamineRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new GoodsExamine();
        entity.CreatedById = request.CreatedById;

        entity.Number = _numberSequenceService.GenerateNumber(nameof(GoodsExamine), "", "GE");
        
        entity.Status = (GoodsExamineStatus)int.Parse(request.Status!);
        entity.Description = request.Description;
        entity.PurchaseOrderId = request.PurchaseOrderId;
        entity.CommitteeDesionNumber = request.CommitteeDesionNumber;
        
        entity.ExamineDate = request.ExamineDate?.ToUniversalTime();
        entity.CommiteeDate = request.CommiteeDate?.ToUniversalTime();
        await _deliveryOrderRepository.CreateAsync(entity, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        //var defaultWarehouse = await _warehouseRepository
        //   .GetQuery()
        //   .ApplyIsDeletedFilter(false)
        //   .Where(x => x.SystemWarehouse == false)
        //   .FirstOrDefaultAsync(cancellationToken);

        //if (defaultWarehouse != null)
        //{
        //    var items = await _purchaseOrderItemRepository
        //        .GetQuery()
        //        .ApplyIsDeletedFilter(false)
        //        .Where(x => x.PurchaseOrderId == entity.PurchaseOrderId)
        //        .Include(x => x.Product)
        //        .ToListAsync(cancellationToken);

        //    foreach (var item in items)
        //    {
        //        if (item?.Product?.Physical ?? false)
        //        {
        //            await _inventoryTransactionService.GoodsExamineCreateInvenTrans(

        //                entity.Id,
        //                defaultWarehouse.Id,
        //                item.ProductId,
        //                item.Percentage,

        //                item.Reasons,
        //                item.ItemStatus,
        //                item.Quantity,



        //                entity.CreatedById,


        //                cancellationToken
        //                );

        //        }
        //    }
        //}


        if (request.committeeList != null && request.committeeList.Any())
        {
            foreach (var committeeDto in request.committeeList)
            {
                var committee = new ExamineCommitee
                {
                    GoodsExamineId = entity.Id,
                    EmployeeID = committeeDto.EmployeeID,

                    EmployeePositionID = committeeDto.EmployeePositionID,
                    EmployeeName = committeeDto.EmployeeName,
                    EmployeePositionName = committeeDto.EmployeePositionName,
                    EmployeeType = committeeDto.EmployeeType,
                    Description = committeeDto.Description,
                    CreatedById = request.CreatedById
                };

                await _examineCommiteeRepository.CreateAsync(committee, cancellationToken);
            }

            await _unitOfWork.SaveAsync(cancellationToken);
        }





        return new CreateGoodsExamineResult
        {
            Data = entity
        };

    }
   
}