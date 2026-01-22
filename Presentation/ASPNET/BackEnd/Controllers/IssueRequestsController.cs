using Application.Features.IssueRequestsItemManager.Queries;
using Application.Features.IssueRequestsManager.Commands;
using Application.Features.IssueRequestsManager.Queries;
using ASPNET.BackEnd.Common.Base;
using ASPNET.BackEnd.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ASPNET.BackEnd.Controllers;

[Route("api/[controller]")]
public class IssueRequestsController : BaseApiController
{
    public IssueRequestsController(ISender sender) : base(sender)
    {
    }

    [Authorize]
    [HttpPost("CreateIssueRequests")]
    public async Task<ActionResult<ApiSuccessResult<CreateIssueRequestsResult>>> CreateIssueRequestsAsync(CreateIssueRequests request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<CreateIssueRequestsResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(CreateIssueRequestsAsync)}",
            Content = response
        });
    }
    //[HttpPost("UpdateIssueRequests")]
    //public async Task<IActionResult> UpdateIssueRequestsAsync(
    //[FromBody] JsonElement body,
    //CancellationToken cancellationToken)
    //{
    //    return Ok(body.ToString());
    //}

    [Authorize]
    [HttpPost("UpdateIssueRequests")]
    public async Task<ActionResult<ApiSuccessResult<UpdateIssueRequestsResult>>> UpdateIssueRequestsAsync( UpdateIssueRequestsRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<UpdateIssueRequestsResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(UpdateIssueRequestsAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpPost("DeleteIssueRequests")]
    public async Task<ActionResult<ApiSuccessResult<DeleteIssueRequestsResult>>> DeleteIssueRequestsAsync(DeleteIssueRequestsRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<DeleteIssueRequestsResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(DeleteIssueRequestsAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpGet("GetIssueRequestsList")]
    public async Task<ActionResult<ApiSuccessResult<GetIssueRequestsListResult>>> GetIssueRequestsListAsync(
        CancellationToken cancellationToken,
        [FromQuery] bool isDeleted = false
        )
    {
        var request = new GetIssueRequestsListRequest { IsDeleted = isDeleted };
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetIssueRequestsListResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetIssueRequestsListAsync)}",
            Content = response
        });
    }


    [Authorize]
    [HttpGet("GetIssueRequestsStatusList")]
    public async Task<ActionResult<ApiSuccessResult<GetIssueRequestsStatusListResult>>> GetIssueRequestsStatusListAsync(
        CancellationToken cancellationToken
        )
    {
        var request = new GetIssueRequestsStatusListRequest { };
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetIssueRequestsStatusListResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetIssueRequestsStatusListAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpGet("GetIssueRequestsSingle")]
    public async Task<ActionResult<ApiSuccessResult<GetIssueRequestsSingleResult>>> GetIssueRequestsSingleAsync(
    CancellationToken cancellationToken,
    [FromQuery] string id
    )
    {
        var request = new GetIssueRequestsSingleRequest { Id = id };
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetIssueRequestsSingleResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetIssueRequestsSingleAsync)}",
            Content = response
        });
    }
    [Authorize]
    [HttpGet("GetProductCurrentStock")]
    public async Task<ActionResult<ApiSuccessResult<GetProductCurrentStockResult>>> GetProductCurrentStock(
     [FromQuery] string productId, string warehouseId,
     CancellationToken cancellationToken)
    {
        var request = new GetProductCurrentStockRequest
        {
            ProductId = productId,
            WarehouseId = warehouseId
        };

        var result = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetProductCurrentStockResult>
        {
            Code = StatusCodes.Status200OK,
            Message = "Success executing GetProductCurrentStock",
            Content = result
        });
    }



    [Authorize]
    [HttpGet("GetEmployeesByDepartment")]
    public async Task<ActionResult<ApiSuccessResult<GetEmployeesByDepartmentForIssueRequestResult>>>
    GetEmployeesByDepartmentAsync(
         string departmentId,
        CancellationToken cancellationToken)
    {
        var request = new GetEmployeesByDepartmentForIssueRequestQuery
        {
            DepartmentId = departmentId
        };

        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetEmployeesByDepartmentForIssueRequestResult>
        {
            Code = StatusCodes.Status200OK,
            Message = "Success executing GetEmployeesByDepartment",
            Content = response
        });
    }



}


