using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.DashboardManager.Queries;


public class GetSalesDashboardDto
{
    public List<IssueRequestsItem>? SalesOrderDashboard { get; init; }
    public List<BarSeries>? SalesByCustomerGroupDashboard { get; init; }
    public List<BarSeries>? SalesByCustomerCategoryDashboard { get; init; }
}

public class GetSalesDashboardResult
{
    public GetSalesDashboardDto? Data { get; init; }
}

public class GetSalesDashboardRequest : IRequest<GetSalesDashboardResult>
{
}

public class GetSalesDashboardHandler : IRequestHandler<GetSalesDashboardRequest, GetSalesDashboardResult>
{
    private readonly IQueryContext _context;

    public GetSalesDashboardHandler(IQueryContext context)
    {
        _context = context;
    }

    public async Task<GetSalesDashboardResult> Handle(GetSalesDashboardRequest request, CancellationToken cancellationToken)
    {

        var IssueRequestsItemData = await _context.IssueRequestsItem
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Include(x => x.IssueRequests)
            .Include(x => x.Product)
            .Where(x => x.IssueRequests!.OrderStatus == SalesOrderStatus.Confirmed)
            .OrderByDescending(x => x.IssueRequests!.OrderDate)
            .Take(30)
            .ToListAsync(cancellationToken);

        var salesByCustomerGroupData = _context.IssueRequestsItem
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
                .Include(x => x.IssueRequests)
                    .ThenInclude(x => x!.Employee)
                        .ThenInclude(x => x!.Department)
                .Include(x => x.Product)
                .Where(x => x.Product!.Physical == true)
            .Select(x => new
            {
                Status = x.IssueRequests!.OrderStatus,
                CustomerGroupName = x.IssueRequests!.Employee!.Department!.Name,
                Quantity = x.RequestedQuantity
            })
            .GroupBy(x => new { x.Status, x.CustomerGroupName })
            .Select(g => new
            {
                Status = g.Key.Status,
                CustomerGroupName = g.Key.CustomerGroupName,
                Quantity = g.Sum(x => x.Quantity)
            })
            .ToList();

        var salesByCustomerCategoryData = _context.IssueRequestsItem
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Include(x => x.IssueRequests)
                .ThenInclude(x => x!.Employee)
                    .ThenInclude(x => x!.Department)
            .Include(x => x.Product)
            .Where(x => x.Product!.Physical == true)
            .Select(x => new
            {
                Status = x.IssueRequests!.OrderStatus,
                CustomerCategoryName = x.IssueRequests!.Employee!.Department!.Name,
                Quantity = x.RequestedQuantity
            })
            .GroupBy(x => new { x.Status, x.CustomerCategoryName })
            .Select(g => new
            {
                Status = g.Key.Status,
                CustomerCategoryName = g.Key.CustomerCategoryName,
                Quantity = g.Sum(x => x.Quantity)
            })
            .ToList();


        var result = new GetSalesDashboardResult
        {
            Data = new GetSalesDashboardDto
            {
                SalesOrderDashboard = IssueRequestsItemData,
                SalesByCustomerGroupDashboard =
                    Enum.GetValues(typeof(SalesOrderStatus))
                    .Cast<SalesOrderStatus>()
                    .Select(status => new BarSeries
                    {
                        Type = "Column",
                        XName = "x",
                        Width = 2,
                        YName = "y",
                        Name = Enum.GetName(typeof(SalesOrderStatus), status)!,
                        ColumnSpacing = 0.1,
                        TooltipMappingName = "tooltipMappingName",
                        DataSource = salesByCustomerGroupData
                            .Where(x => x.Status == status)
                            .Select(x => new BarDataItem
                            {
                                X = x.CustomerGroupName ?? "",
                                TooltipMappingName = x.CustomerGroupName ?? "",
                                Y = (int)x.Quantity!.Value
                            }).ToList()
                    })
                    .ToList(),
                SalesByCustomerCategoryDashboard =
                    Enum.GetValues(typeof(SalesOrderStatus))
                    .Cast<SalesOrderStatus>()
                    .Select(status => new BarSeries
                    {
                        Type = "Bar",
                        XName = "x",
                        Width = 2,
                        YName = "y",
                        Name = Enum.GetName(typeof(SalesOrderStatus), status)!,
                        ColumnSpacing = 0.1,
                        TooltipMappingName = "tooltipMappingName",
                        DataSource = salesByCustomerCategoryData
                            .Where(x => x.Status == status)
                            .Select(x => new BarDataItem
                            {
                                X = x.CustomerCategoryName ?? "",
                                TooltipMappingName = x.CustomerCategoryName ?? "",
                                Y = (int)x.Quantity!.Value
                            }).ToList()
                    })
                    .ToList()
            }
        };

        return result;
    }
}
