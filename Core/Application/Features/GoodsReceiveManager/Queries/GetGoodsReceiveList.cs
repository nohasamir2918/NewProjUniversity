using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.GoodsReceiveManager.Queries;

public record GetGoodsReceiveListDto
{
    public string? Id { get; init; }
    public string? Number { get; init; }
    public DateTime? ReceiveDate { get; init; }
    public GoodsReceiveStatus? Status { get; init; }
    public string? StatusName { get; init; }
    public string? Description { get; init; }
    public string? PurchaseOrderId { get; init; }
    public string? PurchaseOrderNumber { get; init; }
    public DateTime? CreatedAtUtc { get; init; }
    public string? WarehouseId { get; init; }
}

public class GetGoodsReceiveListProfile : Profile
{
    public GetGoodsReceiveListProfile()
    {
        CreateMap<GoodsReceive, GetGoodsReceiveListDto>()
            .ForMember(
                dest => dest.PurchaseOrderNumber,
                opt => opt.MapFrom(src => src.PurchaseOrder != null ? src.PurchaseOrder.Number : string.Empty)
            )
            .ForMember(
                dest => dest.StatusName,
                opt => opt.MapFrom(src => src.Status.HasValue ? src.Status.Value.ToFriendlyName() : string.Empty)
            );

    }
}

public class GetGoodsReceiveListResult
{
    public List<GetGoodsReceiveListDto>? Data { get; init; }
}

public class GetGoodsReceiveListRequest : IRequest<GetGoodsReceiveListResult>
{
    public bool IsDeleted { get; init; } = false;
}


public class GetGoodsReceiveListHandler : IRequestHandler<GetGoodsReceiveListRequest, GetGoodsReceiveListResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public GetGoodsReceiveListHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<GetGoodsReceiveListResult> Handle(
     GetGoodsReceiveListRequest request,
     CancellationToken cancellationToken)
    {
        var data = await _context.GoodsReceive
            .AsNoTracking()
            .ApplyIsDeletedFilter(request.IsDeleted)
            .Include(x => x.PurchaseOrder)
            .Select(gr => new GetGoodsReceiveListDto
            {
                Id = gr.Id,
                Number = gr.Number,
                ReceiveDate = gr.ReceiveDate,
                Status = gr.Status,
                StatusName = gr.Status.HasValue
                    ? gr.Status.Value.ToFriendlyName()
                    : string.Empty,
                Description = gr.Description,
                PurchaseOrderId = gr.PurchaseOrderId,
                PurchaseOrderNumber = gr.PurchaseOrder != null
                    ? gr.PurchaseOrder.Number
                    : string.Empty,
                CreatedAtUtc = gr.CreatedAtUtc,

                // ✅ هنا الحل
                WarehouseId = _context.InventoryTransaction
                    .Where(t =>
                        t.ModuleId == gr.Id &&
                        t.ModuleName == nameof(GoodsReceive) &&
                        !t.IsDeleted)
                    .Select(t => t.WarehouseId)
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        return new GetGoodsReceiveListResult
        {
            Data = data
        };
    }

}



