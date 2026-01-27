using Application.Common.Repositories;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using System.Diagnostics;


namespace Application.Features.IssueRequestsManager.Commands;

public class CreateIssueRequestsResult
{
    public IssueRequests? Data { get; set; }
}

public class CreateIssueRequests : IRequest<CreateIssueRequestsResult>
{
    public DateTime? OrderDate { get; init; }
    public string? OrderStatus { get; init; }
    public string? Description { get; init; }
    public string? EmployeeId { get; init; }
    public string? WarehouseId { get; init; }
    public string? TaxId { get; init; }
    public string? CreatedById { get; init; }
}

public class CreateIssueRequestsValidator : AbstractValidator<CreateIssueRequests>
{
    public CreateIssueRequestsValidator()
    {
        RuleFor(x => x.OrderDate).NotEmpty();
        RuleFor(x => x.OrderStatus).NotEmpty();
        RuleFor(x => x.EmployeeId).NotEmpty();
        RuleFor(x => x.WarehouseId).NotEmpty();
        //RuleFor(x => x.TaxId).NotEmpty();
    }
}

public class CreateIssueRequestsHandler : IRequestHandler<CreateIssueRequests, CreateIssueRequestsResult>
{
    private readonly ICommandRepository<IssueRequests> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly IssueRequestsService _IssueRequestsService;

    public CreateIssueRequestsHandler(
        ICommandRepository<IssueRequests> repository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        IssueRequestsService IssueRequestsService
        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _IssueRequestsService = IssueRequestsService;
    }

    public async Task<CreateIssueRequestsResult> Handle(CreateIssueRequests request, CancellationToken cancellationToken = default)
    {

        
        var entity = new IssueRequests();
        entity.CreatedById = request.CreatedById;

        entity.Number = _numberSequenceService.GenerateNumber(nameof(IssueRequests), "", "IR");
        entity.OrderDate = request.OrderDate;
    
        entity.OrderStatus = (SalesOrderStatus)int.Parse(request.OrderStatus!);
        entity.Description = request.Description;
        entity.EmployeeId = request.EmployeeId;
        entity.WarehouseId = request.WarehouseId;
        entity.TaxId = request.TaxId;
        entity.BeforeTaxAmount = 0;
        entity.TaxAmount = 0;
        entity.AfterTaxAmount = 0;
        await _repository.CreateAsync(entity, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        _IssueRequestsService.Recalculate(entity.Id);

        return new CreateIssueRequestsResult
        {
            Data = entity
        };
    }
}