using System.Linq;
using Application.Common.Repositories;
using Application.Features.InventoryTransactionManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.GoodsExamineManager.Commands;

public class UpdateGoodsExamineResult
{
    public GoodsExamine? Data { get; set; }
}

public class UpdateGoodsExamineRequest : IRequest<UpdateGoodsExamineResult>
{
    public string? Id { get; init; }
    public DateTime? ExamineDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? PurchaseOrderId { get; init; }
    public string? UpdatedById { get; init; }
    public DateTime? CommiteeDate { get; set; }
    public string? CommitteeDesionNumber { get; set; }
    public List<ExamineCommiteeDto>? committeeList { get; init; }

}

public class UpdateGoodsExamineValidator : AbstractValidator<UpdateGoodsExamineRequest>
{
    public UpdateGoodsExamineValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.ExamineDate).NotEmpty();
        RuleFor(x => x.Status).NotEmpty();
        RuleFor(x => x.PurchaseOrderId).NotEmpty();
    }
}

public class UpdateGoodsExamineHandler : IRequestHandler<UpdateGoodsExamineRequest, UpdateGoodsExamineResult>
{
    private readonly ICommandRepository<GoodsExamine> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ICommandRepository<ExamineCommitee> _committeeRepository;

    public UpdateGoodsExamineHandler(
        ICommandRepository<GoodsExamine> repository,
        IUnitOfWork unitOfWork,
        InventoryTransactionService inventoryTransactionService, ICommandRepository<ExamineCommitee> committeeRepository
        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _inventoryTransactionService = inventoryTransactionService;
         _committeeRepository= committeeRepository;
    }

    public async Task<UpdateGoodsExamineResult> Handle(UpdateGoodsExamineRequest request, CancellationToken cancellationToken)
    {

        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Entity not found: {request.Id}");
        }

        entity.UpdatedById = request.UpdatedById;
        entity.CommiteeDate = request.CommiteeDate;
        entity.CommitteeDesionNumber = request.CommitteeDesionNumber;
        entity.ExamineDate = request.ExamineDate;
        entity.Status = (GoodsExamineStatus)int.Parse(request.Status!);
        entity.Description = request.Description;
        entity.PurchaseOrderId = request.PurchaseOrderId;
       entity.CommiteeDate = request.CommiteeDate;
        entity.CommitteeDesionNumber=request.CommitteeDesionNumber;
        _repository.Update(entity);


        // 🧹 حذف اللجان القديمة
        // 🧹 احصل على كل اللجان القديمة
        var existingCommittees = await _committeeRepository
            .GetQuery()
            .Where(x => x.GoodsExamineId == entity.Id)
            .ToListAsync(cancellationToken);

        // 🟢 علامة حذف مؤقتة لكل عضو موجود
        foreach (var oldMember in existingCommittees)
        {
            var dto = request.committeeList?.FirstOrDefault(c => c.Id == oldMember.Id);
            if (dto == null)
            {
                // لو العضو مش موجود في request => اعتبره محذوف
                oldMember.IsDeleted = true;
            }
            else
            {
                oldMember.EmployeeName = dto.EmployeeName;
                oldMember.EmployeePositionName = dto.EmployeePositionName;
                oldMember.EmployeeType = dto.EmployeeType;
                oldMember.Description = dto.Description;
                oldMember.IsDeleted = dto.IsDeleted;
            }
        }

        // 🟢 إضافة أعضاء جدد
        if (request.committeeList != null)
        {
            foreach (var dto in request.committeeList)
            {
                if (string.IsNullOrEmpty(dto.Id))
                {
                    await _committeeRepository.CreateAsync(new ExamineCommitee
                    {
                        GoodsExamineId = entity.Id,
                        EmployeeName = dto.EmployeeName,
                        EmployeePositionName = dto.EmployeePositionName,
                        EmployeeType = dto.EmployeeType,
                        Description = dto.Description,
                        CreatedById = request.UpdatedById
                    }, cancellationToken);
                }
            }
        }



        await _unitOfWork.SaveAsync(cancellationToken);

        await _inventoryTransactionService.PropagateParentUpdate(
            entity.Id,
            nameof(GoodsExamine),
            entity.ExamineDate,
            (InventoryTransactionStatus?)entity.Status,
            entity.IsDeleted,
            entity.UpdatedById,
            null,   
            null,
            cancellationToken
            );

        return new UpdateGoodsExamineResult
        {
            Data = entity
        };
    }
}

