using Application.Common.Repositories;
using Application.Features.InventoryTransactionManager;
using Application.Features.IssueRequestsManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;

namespace Application.Features.IssueRequestsItemManager.Commands;

public class DeleteIssueRequestsItemResult
{
    public IssueRequestsItem? Data { get; set; }
}

public class DeleteIssueRequestsItemRequest : IRequest<DeleteIssueRequestsItemResult>
{
    public string? Id { get; init; }
    public string? DeletedById { get; init; }
}

public class DeleteIssueRequestsItemValidator : AbstractValidator<DeleteIssueRequestsItemRequest>
{
    public DeleteIssueRequestsItemValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}

public class DeleteIssueRequestsItemHandler : IRequestHandler<DeleteIssueRequestsItemRequest, DeleteIssueRequestsItemResult>
{
    private readonly ICommandRepository<IssueRequestsItem> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IssueRequestsService _IssueRequestsService;
    private readonly InventoryTransactionService _inventoryTransactionService;
    public DeleteIssueRequestsItemHandler(
        ICommandRepository<IssueRequestsItem> repository,
        IUnitOfWork unitOfWork,
        IssueRequestsService IssueRequestsService, InventoryTransactionService inventoryTransactionService
        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _IssueRequestsService = IssueRequestsService;
        _inventoryTransactionService = inventoryTransactionService;

    }

    public async Task<DeleteIssueRequestsItemResult> Handle(DeleteIssueRequestsItemRequest request, CancellationToken cancellationToken)
    {

        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Entity not found: {request.Id}");
        }
        // 1. Delete related inventory transactions
        var invTrans = await _inventoryTransactionService
            .IssueRequestGetInvenTransList(
                entity.IssueRequestsId,
                nameof(IssueRequests),
                 entity.ProductId,
                cancellationToken
            );

        foreach (var trans in invTrans)
        {
            await _inventoryTransactionService.IssueRequestDeleteInvenTrans(
                trans.Id,
                request.DeletedById,
                cancellationToken
            );


            await _inventoryTransactionService.PropagateParentUpdate(
            entity.IssueRequestsId,
            nameof(IssueRequests),
            entity.CreatedAtUtc,
            InventoryTransactionStatus.Cancelled,
            entity.IsDeleted,
            entity.UpdatedById,
            null,
            null,
            cancellationToken);
        }
        // 2. Delete IssueRequestsItem
        entity.UpdatedById = request.DeletedById;
        _repository.Delete(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        // 3. Recalculate parent
        _IssueRequestsService.Recalculate(entity.IssueRequestsId!);

 

        return new DeleteIssueRequestsItemResult
        {
            Data = entity
        };
    }
}

