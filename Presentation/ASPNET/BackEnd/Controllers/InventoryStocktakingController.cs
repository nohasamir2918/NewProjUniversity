using Application.Features.InventoryTransactionManager.Queries;
using ASPNET.BackEnd.Common.Base;
using ASPNET.BackEnd.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASPNET.BackEnd.Controllers
{
    [Route("api/[controller]")]
    public class InventoryStocktakingController : BaseApiController
    {
        private readonly IMediator _mediator;

        //InventoryStocktaking/InventoryStocktaking
        public InventoryStocktakingController(ISender sender, IMediator mediator) : base(sender)
        {
            _mediator = mediator;
        }

        [Authorize]
        [HttpPost("GetStockForWarehouseList")]
        public async Task<ActionResult<ApiSuccessResult<InventoryStocktakingResult>>> GetStockForWarehouseListAsync(
           [FromBody] InventoryStocktakingRequest request,
       CancellationToken cancellationToken
       )
        {

            var response = await _sender.Send(request, cancellationToken);

            return Ok(new ApiSuccessResult<InventoryStocktakingResult>
            {
                Code = StatusCodes.Status200OK,
                Message = $"Success executing {nameof(GetStockForWarehouseListAsync)}",
                Content = response
            });
        }
    }
}
