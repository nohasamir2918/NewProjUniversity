using Application.Common.Repositories;
using Application.Features.InventoryTransactionManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;

namespace Application.Features.IssueRequestsManager.Commands;

public class UpdateIssueRequestsResult
{
    public IssueRequests? Data { get; set; }
}

public class UpdateIssueRequestsRequest : IRequest<UpdateIssueRequestsResult>
{
    public string? Id { get; set; }
    public DateTime? OrderDate { get; set; }
    public SalesOrderStatus OrderStatus { get; set; }

    public string? Description { get; set; }
    public string? EmployeeId { get; set; }
    public string? WarehouseId { get; init; }
    public string? TaxId { get; set; }
    public string? UpdatedById { get; set; }
}

public class UpdateIssueRequestsValidator : AbstractValidator<UpdateIssueRequestsRequest>
{
    public UpdateIssueRequestsValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.OrderDate).NotEmpty();
        RuleFor(x => x.OrderStatus).NotEmpty();
        RuleFor(x => x.EmployeeId).NotEmpty();
        RuleFor(x => x.WarehouseId).NotEmpty();
        //RuleFor(x => x.TaxId).NotEmpty();
    }
}

public class UpdateIssueRequestsHandler : IRequestHandler<UpdateIssueRequestsRequest, UpdateIssueRequestsResult>
{
    private readonly ICommandRepository<IssueRequests> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IssueRequestsService _IssueRequestsService;
    private readonly InventoryTransactionService _inventoryTransactionService;

    public UpdateIssueRequestsHandler(
        ICommandRepository<IssueRequests> repository,
        IssueRequestsService IssueRequestsService,
        IUnitOfWork unitOfWork, InventoryTransactionService inventoryTransactionService
        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _IssueRequestsService = IssueRequestsService;
        _inventoryTransactionService = inventoryTransactionService;

    }

    public async Task<UpdateIssueRequestsResult> Handle(UpdateIssueRequestsRequest request, CancellationToken cancellationToken)
    {

        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Entity not found: {request.Id}");
        }
     
        entity.UpdatedById = request.UpdatedById;
        entity.OrderDate = request.OrderDate;
        entity.OrderStatus = request.OrderStatus;
        entity.Description = request.Description;
        entity.EmployeeId = request.EmployeeId;
        entity.WarehouseId = request.WarehouseId;
        entity.TaxId = request.TaxId;

        _repository.Update(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        //نعدل حالة ال inventory transaction لو حالة الطلب اتغيرت للتأكيد
        if (entity.OrderStatus == SalesOrderStatus.Confirmed)
        {
            await _inventoryTransactionService
                .ConfirmIssueRequestAsync(entity.Id, request.UpdatedById, cancellationToken);
        }

        _IssueRequestsService.Recalculate(entity.Id);

        return new UpdateIssueRequestsResult
        {
            Data = entity
        };
    }
}

