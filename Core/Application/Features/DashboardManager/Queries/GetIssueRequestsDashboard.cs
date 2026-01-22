using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.DashboardManager.Queries;


public class GetIssueRequestsDashboardDto
{
    public List<IssueRequestsItem>? IssueRequestsDashboard { get; init; }
    public List<BarSeries>? IssueRequestsByDepartmentDashboard { get; init; }
    //public List<BarSeries>? SalesByCustomerCategoryDashboard { get; init; }
}

public class GetIssueRequestsDashboardResult
{
    public GetIssueRequestsDashboardDto? Data { get; init; }
}

public class GetIssueRequestsDashboardRequest : IRequest<GetIssueRequestsDashboardResult>
{
}

public class GetIssueRequestsDashboardHandler : IRequestHandler<GetIssueRequestsDashboardRequest, GetIssueRequestsDashboardResult>
{
    private readonly IQueryContext _context;

    public GetIssueRequestsDashboardHandler(IQueryContext context)
    {
        _context = context;
    }

    public async Task<GetIssueRequestsDashboardResult> Handle(GetIssueRequestsDashboardRequest request, CancellationToken cancellationToken)
    {

        var issueRequestsItemData = await _context.IssueRequestsItem
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Include(x => x.IssueRequests)
            .Include(x => x.Product)
            .Where(x => x.IssueRequests!.OrderStatus == SalesOrderStatus.Confirmed)
            .OrderByDescending(x => x.IssueRequests!.OrderDate)
            .Take(30)
            .ToListAsync(cancellationToken);

        var issueRequestsByDepartment = _context.IssueRequestsItem
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
                DepartmentName = x.IssueRequests!.Employee!.Department!.Name,
                Quantity = x.SuppliedQuantity
            })
            .GroupBy(x => new { x.Status, x.DepartmentName })
            .Select(g => new
            {
                Status = g.Key.Status,
                DepartmentName = g.Key.DepartmentName,
                Quantity = g.Sum(x => x.Quantity)
            })
            .ToList();

        //var salesByCustomerCategoryData = _context.SalesOrderItem
        //    .AsNoTracking()
        //    .ApplyIsDeletedFilter(false)
        //    .Include(x => x.SalesOrder)
        //        .ThenInclude(x => x!.Customer)
        //            .ThenInclude(x => x!.CustomerCategory)
        //    .Include(x => x.Product)
        //    .Where(x => x.Product!.Physical == true)
        //    .Select(x => new
        //    {
        //        Status = x.SalesOrder!.OrderStatus,
        //        CustomerCategoryName = x.SalesOrder!.Customer!.CustomerCategory!.Name,
        //        Quantity = x.Quantity
        //    })
        //    .GroupBy(x => new { x.Status, x.CustomerCategoryName })
        //    .Select(g => new
        //    {
        //        Status = g.Key.Status,
        //        CustomerCategoryName = g.Key.CustomerCategoryName,
        //        Quantity = g.Sum(x => x.Quantity)
        //    })
        //    .ToList();


        var result = new GetIssueRequestsDashboardResult
        {
            Data = new GetIssueRequestsDashboardDto
            {
                IssueRequestsDashboard = issueRequestsItemData,
                IssueRequestsByDepartmentDashboard =
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
                        DataSource = issueRequestsByDepartment
                            .Where(x => x.Status == status)
                            .Select(x => new BarDataItem
                            {
                                X = x.DepartmentName ?? "",
                                TooltipMappingName = x.DepartmentName ?? "",
                                Y = (int)x.Quantity!.Value
                            }).ToList()
                    })
                    .ToList(),
                //SalesByCustomerCategoryDashboard =
                //    Enum.GetValues(typeof(SalesOrderStatus))
                //    .Cast<SalesOrderStatus>()
                //    .Select(status => new BarSeries
                //    {
                //        Type = "Bar",
                //        XName = "x",
                //        Width = 2,
                //        YName = "y",
                //        Name = Enum.GetName(typeof(SalesOrderStatus), status)!,
                //        ColumnSpacing = 0.1,
                //        TooltipMappingName = "tooltipMappingName",
                //        DataSource = salesByCustomerCategoryData
                //            .Where(x => x.Status == status)
                //            .Select(x => new BarDataItem
                //            {
                //                X = x.CustomerCategoryName ?? "",
                //                TooltipMappingName = x.CustomerCategoryName ?? "",
                //                Y = (int)x.Quantity!.Value
                //            }).ToList()
                //    })
                //    .ToList()
            }
        };

        return result;
    }
}
