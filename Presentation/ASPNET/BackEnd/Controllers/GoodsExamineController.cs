using Application.Features.GoodsExamineManager.Commands;
using Application.Features.GoodsExamineManager.Queries;
using ASPNET.BackEnd.Common.Base;
using ASPNET.BackEnd.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ASPNET.BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GoodsExamineController : BaseApiController
    {
        public GoodsExamineController(ISender sender) : base(sender)
        {
        }

        [Authorize]
        [HttpPost("CreateGoodsExamine")]
        public async Task<ActionResult<ApiSuccessResult<CreateGoodsExamineResult>>> CreateGoodsExamineAsync(CreateGoodsExamineRequest request, CancellationToken cancellationToken)
        {
            var response = await _sender.Send(request, cancellationToken);

            return Ok(new ApiSuccessResult<CreateGoodsExamineResult>
            {
                Code = StatusCodes.Status200OK,
                Message = $"Success executing {nameof(CreateGoodsExamineAsync)}",
                Content = response
            });
        }

        [Authorize]
        [HttpPost("UpdateGoodsExamine")]
        public async Task<ActionResult<ApiSuccessResult<UpdateGoodsExamineResult>>> UpdateGoodsExamineAsync(UpdateGoodsExamineRequest request, CancellationToken cancellationToken)
        {
            var response = await _sender.Send(request, cancellationToken);

            return Ok(new ApiSuccessResult<UpdateGoodsExamineResult>
            {
                Code = StatusCodes.Status200OK,
                Message = $"Success executing {nameof(UpdateGoodsExamineAsync)}",
                Content = response
            });
        }

        [Authorize]
        [HttpPost("DeleteGoodsExamine")]
        public async Task<ActionResult<ApiSuccessResult<DeleteGoodsExamineResult>>> DeleteGoodsExamineAsync(DeleteGoodsExamineRequest request, CancellationToken cancellationToken)
        {
            var response = await _sender.Send(request, cancellationToken);

            return Ok(new ApiSuccessResult<DeleteGoodsExamineResult>
            {
                Code = StatusCodes.Status200OK,
                Message = $"Success executing {nameof(DeleteGoodsExamineAsync)}",
                Content = response
            });
        }

        [Authorize]
        [HttpGet("GetGoodsExamineList")]
        public async Task<ActionResult<ApiSuccessResult<GetGoodsExamineListResult>>> GetGoodsExamineListAsync(
            CancellationToken cancellationToken,
            [FromQuery] bool isDeleted = false
            )
        {
            var request = new GetGoodsExamineListRequest { IsDeleted = isDeleted };
            var response = await _sender.Send(request, cancellationToken);

            return Ok(new ApiSuccessResult<GetGoodsExamineListResult>
            {
                Code = StatusCodes.Status200OK,
                Message = $"Success executing {nameof(GetGoodsExamineListAsync)}",
                Content = response
            });
        }



        [Authorize]
        [HttpGet("GetGoodsExamineStatusList")]
        public async Task<ActionResult<ApiSuccessResult<GetGoodsExamineStatusListResult>>> GetGoodsExamineStatusListAsync(
            CancellationToken cancellationToken
            )
        {
            var request = new GetGoodsExamineStatusListRequest { };
            var response = await _sender.Send(request, cancellationToken);

            return Ok(new ApiSuccessResult<GetGoodsExamineStatusListResult>
            {
                Code = StatusCodes.Status200OK,
                Message = $"Success executing {nameof(GetGoodsExamineStatusListAsync)}",
                Content = response
            });
        }


        [Authorize]
        [HttpGet("GetGoodsExamineSingle")]
        public async Task<ActionResult<ApiSuccessResult<GetGoodsExamineSingleResult>>> GetGoodsExamineSingleAsync(
        CancellationToken cancellationToken,
        [FromQuery] string id
        )
        
        {
            var request = new GetGoodsExamineSingleRequest { Id = id };
            var response = await _sender.Send(request, cancellationToken);

            return Ok(new ApiSuccessResult<GetGoodsExamineSingleResult>
            {
                Code = StatusCodes.Status200OK,
                Message = $"Success executing {nameof(GetGoodsExamineSingleAsync)}",
                Content = response
            });
        }
    }
}
