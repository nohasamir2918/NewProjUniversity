using Application.Features.ItemReturnRequestsManager.Commands;
using Application.Features.ItemReturnRequestsManager.Queries;
using ASPNET.BackEnd.Common.Base;
using ASPNET.BackEnd.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASPNET.BackEnd.Controllers;

[Route("api/[controller]")]
public class ItemReturnRequestsController : BaseApiController
{
    public ItemReturnRequestsController(ISender sender) : base(sender)
    {
    }

    [Authorize]
    [HttpPost("CreateItemReturnRequests")]
    public async Task<ActionResult<ApiSuccessResult<CreateItemReturnRequestsResult>>> CreateItemReturnRequestsAsync(CreateItemReturnRequestsRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<CreateItemReturnRequestsResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(CreateItemReturnRequestsAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpPost("UpdateItemReturnRequests")]
    public async Task<ActionResult<ApiSuccessResult<UpdateItemReturnRequestsResult>>> UpdateItemReturnRequestsAsync(UpdateItemReturnRequestsRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<UpdateItemReturnRequestsResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(UpdateItemReturnRequestsAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpPost("DeleteItemReturnRequests")]
    public async Task<ActionResult<ApiSuccessResult<DeleteItemReturnRequestsResult>>> DeleteItemReturnRequestsAsync(DeleteItemReturnRequestsRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<DeleteItemReturnRequestsResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(DeleteItemReturnRequestsAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpGet("GetItemReturnRequestsList")]
    public async Task<ActionResult<ApiSuccessResult<GetItemReturnRequestsListResult>>> GetItemReturnRequestsListAsync(
        CancellationToken cancellationToken,
        [FromQuery] bool isDeleted = false
        )
    {
        var request = new GetItemReturnRequestsListRequest { IsDeleted = isDeleted };
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetItemReturnRequestsListResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetItemReturnRequestsListAsync)}",
            Content = response
        });
    }


    [Authorize]
    [HttpGet("GetItemReturnRequestsStatusList")]
    public async Task<ActionResult<ApiSuccessResult<GetItemReturnRequestsStatusListResult>>> GetItemReturnRequestsStatusListAsync(
        CancellationToken cancellationToken
        )
    {
        var request = new GetItemReturnRequestsStatusListRequest { };
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetItemReturnRequestsStatusListResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetItemReturnRequestsStatusListAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpGet("GetItemReturnRequestsSingle")]
    public async Task<ActionResult<ApiSuccessResult<GetItemReturnRequestsSingleResult>>> GetItemReturnRequestsSingleAsync(
    CancellationToken cancellationToken,
    [FromQuery] string id
    )
    {
        var request = new GetItemReturnRequestsSingleRequest { Id = id };
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetItemReturnRequestsSingleResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetItemReturnRequestsSingleAsync)}",
            Content = response
        });
    }


}


