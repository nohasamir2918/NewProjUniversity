using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.IssueRequestsManager.Queries;

public class GetEmployeesByDepartmentForIssueRequestResult
{
    public List<EmployeeLookupDto> Employees { get; set; } = new();
}

public class EmployeeLookupDto
{
    public string? Id { get; init; }
    public string? Name { get; set; }
    public string? DepartmentId { get; set; }
}
public class GetEmployeesByDepartmentForIssueRequestQuery
    : IRequest<GetEmployeesByDepartmentForIssueRequestResult>
{
    public string? DepartmentId { get; set; }
}

public class GetEmployeesByDepartmentForIssueRequestHandler
    : IRequestHandler<GetEmployeesByDepartmentForIssueRequestQuery,
                      GetEmployeesByDepartmentForIssueRequestResult>
{
    private readonly IQueryContext _context;

    public GetEmployeesByDepartmentForIssueRequestHandler(
       IMapper mapper, IQueryContext context)
    {
        
        _context = context;
    }
 
    public async Task<GetEmployeesByDepartmentForIssueRequestResult> Handle(
        GetEmployeesByDepartmentForIssueRequestQuery request,
        CancellationToken cancellationToken)
    {
        var employees = await _context.Employee
            .Where(e => e.DepartmentId == request.DepartmentId && !e.IsDeleted)
            .Select(e => new EmployeeLookupDto
            {
                Id = e.Id,
                Name = e.Name,
                DepartmentId = e.DepartmentId
            })
            .ToListAsync(cancellationToken);

        return new GetEmployeesByDepartmentForIssueRequestResult
        {
            Employees = employees
        };
    }
}



