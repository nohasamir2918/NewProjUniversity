using Application.Common.Repositories;
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

    public CreateItemReturnRequestsHandler(
        ICommandRepository<ItemReturnRequests> repository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        ItemReturnRequestsService ItemReturnRequestsService
        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _ItemReturnRequestsService = ItemReturnRequestsService;
    }

    public async Task<CreateItemReturnRequestsResult> Handle(CreateItemReturnRequestsRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new ItemReturnRequests();
        entity.CreatedById = request.CreatedById;

        entity.Number = _numberSequenceService.GenerateNumber(nameof(ItemReturnRequests), "", "PO");
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

        return new CreateItemReturnRequestsResult
        {
            Data = entity
        };
    }
}