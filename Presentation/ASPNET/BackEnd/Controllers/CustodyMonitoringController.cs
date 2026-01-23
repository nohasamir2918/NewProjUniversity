using Application.Features.InventoryTransactionManager.Queries;
using ASPNET.BackEnd.Common.Base;
using ASPNET.BackEnd.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASPNET.BackEnd.Controllers
{
    [Route("api/[controller]")]
    public class CustodyMonitoringController : BaseApiController
    {
        private readonly IMediator _mediator;

        //CustodyMonitoring/CustodyMonitoring
        public CustodyMonitoringController(ISender sender, IMediator mediator) : base(sender)
        {
            _mediator = mediator;
        }

        [Authorize]
        [HttpPost("CustodyMonitoringList")]
        public async Task<ActionResult<ApiSuccessResult<CustodyMonitoringResult>>> CustodyMonitoringListAsync(
            [FromBody] CustodyMonitoringRequest request,
        CancellationToken cancellationToken
        )
        {
           
            var response = await _sender.Send(request, cancellationToken);

            return Ok(new ApiSuccessResult<CustodyMonitoringResult>
            {
                Code = StatusCodes.Status200OK,
                Message = $"Success executing {nameof(CustodyMonitoringListAsync)}",
                Content = response
            });
        }

    }
}
