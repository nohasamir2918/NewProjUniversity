using Application.Common.CQS.Queries;
using AutoMapper;
using Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ItemReturnRequestsManager.Queries;


public class GetItemReturnRequestsSingleProfile : Profile
{
    public GetItemReturnRequestsSingleProfile()
    {
    }
}

public class GetItemReturnRequestsSingleResult
{
    public ItemReturnRequests? Data { get; init; }
}

public class GetItemReturnRequestsSingleRequest : IRequest<GetItemReturnRequestsSingleResult>
{
    public string? Id { get; init; }
}

public class GetItemReturnRequestsSingleValidator : AbstractValidator<GetItemReturnRequestsSingleRequest>
{
    public GetItemReturnRequestsSingleValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}

public class GetItemReturnRequestsSingleHandler : IRequestHandler<GetItemReturnRequestsSingleRequest, GetItemReturnRequestsSingleResult>
{
    private readonly IQueryContext _context;

    public GetItemReturnRequestsSingleHandler(
        IQueryContext context
        )
    {
        _context = context;
    }

    public async Task<GetItemReturnRequestsSingleResult> Handle(GetItemReturnRequestsSingleRequest request, CancellationToken cancellationToken)
    {
        var query = _context
            .ItemReturnRequests
            .AsNoTracking()
            .Include(x => x.Employee)
            .Include(x => x.Product)
            //.Include(x => x.ItemReturnRequestsItemList.Where(item => !item.IsDeleted))
            //    .ThenInclude(x => x.Product)
            .Where(x => x.Id == request.Id)
            .AsQueryable();

        var entity = await query.SingleOrDefaultAsync(cancellationToken);

        return new GetItemReturnRequestsSingleResult
        {
            Data = entity
        };
    }
}