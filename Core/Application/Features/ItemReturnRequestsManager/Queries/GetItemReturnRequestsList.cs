using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ItemReturnRequestsManager.Queries;

public record GetItemReturnRequestsListDto
{
    public string? Id { get; init; }
    public string? Number { get; set; }
    public DateTime? OrderDate { get; set; }
    public SalesOrderStatus? OrderStatus { get; set; }
    public string? OrderStatusName { get; set; }
    public string? CommitteeDecision { get; set; }
    public string? EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public string? ProductId { get; set; }
    public string? ProductName { get; set; }
    public string? ProductStatus { get; set; }
    public double? UnitPrice { get; set; } = 0;
    public double? Quantity { get; set; }
    public DateTime? CreatedAtUtc { get; set; }
}

public class GetItemReturnRequestsListProfile : Profile
{
    public GetItemReturnRequestsListProfile()
    {
        CreateMap<ItemReturnRequests, GetItemReturnRequestsListDto>()
            .ForMember(
                dest => dest.EmployeeName,
                opt => opt.MapFrom(src => src.Employee != null ? src.Employee.Name : string.Empty)
            )
            .ForMember(
                dest => dest.ProductName,
                opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : string.Empty)
            )
            .ForMember(
                dest => dest.OrderStatusName,
                opt => opt.MapFrom(src => src.OrderStatus.HasValue ? src.OrderStatus.Value.ToFriendlyName() : string.Empty)
            );

    }
}

public class GetItemReturnRequestsListResult
{
    public List<GetItemReturnRequestsListDto>? Data { get; init; }
}

public class GetItemReturnRequestsListRequest : IRequest<GetItemReturnRequestsListResult>
{
    public bool IsDeleted { get; init; } = false;
}


public class GetItemReturnRequestsListHandler : IRequestHandler<GetItemReturnRequestsListRequest, GetItemReturnRequestsListResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public GetItemReturnRequestsListHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<GetItemReturnRequestsListResult> Handle(GetItemReturnRequestsListRequest request, CancellationToken cancellationToken)
    {
        var query = _context
            .ItemReturnRequests
            .AsNoTracking()
            .ApplyIsDeletedFilter(request.IsDeleted)
            .Include(x => x.Employee)
            .Include(x => x.Product)
            .AsQueryable();

        var entities = await query.ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<GetItemReturnRequestsListDto>>(entities);

        return new GetItemReturnRequestsListResult
        {
            Data = dtos
        };
    }


}



