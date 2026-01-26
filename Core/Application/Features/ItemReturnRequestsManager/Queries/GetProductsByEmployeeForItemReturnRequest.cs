using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using Application.Features.IssueRequestsManager.Queries;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ItemReturnRequestsManager.Queries;

public class GetProductsByEmployeeForItemReturnRequestResult
{
    public List<ProductLookupDto> Products { get; set; } = new();
}

public class ProductLookupDto
{
    public string? Id { get; init; }
    public string? Name { get; set; }
    public string? EmployeeId { get; set; }
}
public class GetProductsByEmployeeForItemReturnRequestQuery
    : IRequest<GetProductsByEmployeeForItemReturnRequestResult>
{
    public string? EmployeeId { get; set; }
}

public class GetProductsByEmployeeForItemReturnRequestHandler
    : IRequestHandler<GetProductsByEmployeeForItemReturnRequestQuery,
                      GetProductsByEmployeeForItemReturnRequestResult>
{
    private readonly IQueryContext _context;

    public GetProductsByEmployeeForItemReturnRequestHandler(IQueryContext context)
    {
        _context = context;
    }

    public async Task<GetProductsByEmployeeForItemReturnRequestResult> Handle(
        GetProductsByEmployeeForItemReturnRequestQuery request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(request.EmployeeId))
            return new GetProductsByEmployeeForItemReturnRequestResult();

        var products = await _context.IssueRequestsItem
            .Where(item => item.IssueRequests.EmployeeId == request.EmployeeId) 
            .Select(item => new ProductLookupDto
            {
                Id = item.ProductId,
                Name = item.Product.Name,
                EmployeeId = item.IssueRequests.EmployeeId 
            })
            .Distinct()
            .ToListAsync(cancellationToken);

        return new GetProductsByEmployeeForItemReturnRequestResult
        {
            Products = products
        };
    }
}




