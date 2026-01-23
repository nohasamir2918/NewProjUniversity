using Application.Common.Repositories;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;

namespace Application.Features.ItemReturnRequestsManager.Commands;

public class UpdateItemReturnRequestsResult
{
    public ItemReturnRequests? Data { get; set; }
}

public class UpdateItemReturnRequestsRequest : IRequest<UpdateItemReturnRequestsResult>
{
    public string? Id { get; set; }
    public string? Number { get; set; }
    public DateTime? OrderDate { get; set; }
    public string? OrderStatus { get; set; }
    public string? CommitteeDecision { get; set; }
    public string? EmployeeId { get; set; }
    public string? ProductId { get; set; }
    public string? ProductStatus { get; set; }
    public double? UnitPrice { get; set; } = 0;
    public double? Quantity { get; set; }
    public string? UpdatedById { get; set; }
}

public class UpdateItemReturnRequestsValidator : AbstractValidator<UpdateItemReturnRequestsRequest>
{
    public UpdateItemReturnRequestsValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.OrderDate).NotEmpty();
        RuleFor(x => x.OrderStatus).NotEmpty();
        RuleFor(x => x.EmployeeId).NotEmpty();
        RuleFor(x => x.ProductId).NotEmpty();
    }
}

public class UpdateItemReturnRequestsHandler : IRequestHandler<UpdateItemReturnRequestsRequest, UpdateItemReturnRequestsResult>
{
    private readonly ICommandRepository<ItemReturnRequests> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ItemReturnRequestsService _ItemReturnRequestsService;

    public UpdateItemReturnRequestsHandler(
        ICommandRepository<ItemReturnRequests> repository,
        IUnitOfWork unitOfWork,
        ItemReturnRequestsService ItemReturnRequestsService
        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _ItemReturnRequestsService = ItemReturnRequestsService;
    }

    public async Task<UpdateItemReturnRequestsResult> Handle(UpdateItemReturnRequestsRequest request, CancellationToken cancellationToken)
    {

        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Entity not found: {request.Id}");
        }

        entity.UpdatedById = request.UpdatedById;

        entity.OrderDate = request.OrderDate;
        entity.OrderStatus = (SalesOrderStatus)int.Parse(request.OrderStatus!);
        entity.CommitteeDecision = request.CommitteeDecision;
        entity.ProductId = request.ProductId;
        entity.ProductStatus = request.ProductStatus; 
        entity.EmployeeId = request.EmployeeId;
        entity.Quantity = request.Quantity;
        entity.UnitPrice = request.UnitPrice;

        _repository.Update(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        _ItemReturnRequestsService.Recalculate(entity.Id);

        return new UpdateItemReturnRequestsResult
        {
            Data = entity
        };
    }
}

