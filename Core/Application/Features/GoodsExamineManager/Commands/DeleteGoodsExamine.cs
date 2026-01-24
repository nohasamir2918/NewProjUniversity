using Application.Common.Repositories;
using Application.Features.InventoryTransactionManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;

namespace Application.Features.GoodsExamineManager.Commands;

public class DeleteGoodsExamineResult
{
    public GoodsExamine? Data { get; set; }
}

public class DeleteGoodsExamineRequest : IRequest<DeleteGoodsExamineResult>
{
    public string? Id { get; init; }
    public string? DeletedById { get; init; }
}

public class DeleteGoodsExamineValidator : AbstractValidator<DeleteGoodsExamineRequest>
{
    public DeleteGoodsExamineValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}

public class DeleteGoodsExamineHandler : IRequestHandler<DeleteGoodsExamineRequest, DeleteGoodsExamineResult>
{
    private readonly ICommandRepository<GoodsExamine> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly InventoryTransactionService _inventoryTransactionService;

    public DeleteGoodsExamineHandler(
        ICommandRepository<GoodsExamine> repository,
        IUnitOfWork unitOfWork,
        InventoryTransactionService inventoryTransactionService
        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _inventoryTransactionService = inventoryTransactionService;
    }
    public async Task<DeleteGoodsExamineResult> Handle(DeleteGoodsExamineRequest request, CancellationToken cancellationToken)
    {

        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Entity not found: {request.Id}");
        }

        entity.UpdatedById = request.DeletedById;

        _repository.Delete(entity);
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

        return new DeleteGoodsExamineResult
        {
            Data = entity
        };
    }
}

