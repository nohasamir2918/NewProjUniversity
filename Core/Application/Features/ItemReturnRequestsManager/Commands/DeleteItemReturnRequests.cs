using Application.Common.Repositories;
using Domain.Entities;
using FluentValidation;
using MediatR;

namespace Application.Features.ItemReturnRequestsManager.Commands;

public class DeleteItemReturnRequestsResult
{
    public ItemReturnRequests? Data { get; set; }
}

public class DeleteItemReturnRequestsRequest : IRequest<DeleteItemReturnRequestsResult>
{
    public string? Id { get; init; }
    public string? DeletedById { get; init; }
}

public class DeleteItemReturnRequestsValidator : AbstractValidator<DeleteItemReturnRequestsRequest>
{
    public DeleteItemReturnRequestsValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}

public class DeleteItemReturnRequestsHandler : IRequestHandler<DeleteItemReturnRequestsRequest, DeleteItemReturnRequestsResult>
{
    private readonly ICommandRepository<ItemReturnRequests> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteItemReturnRequestsHandler(
        ICommandRepository<ItemReturnRequests> repository,
        IUnitOfWork unitOfWork
        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DeleteItemReturnRequestsResult> Handle(DeleteItemReturnRequestsRequest request, CancellationToken cancellationToken)
    {

        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Entity not found: {request.Id}");
        }

        entity.UpdatedById = request.DeletedById;

        _repository.Delete(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        return new DeleteItemReturnRequestsResult
        {
            Data = entity
        };
    }
}

