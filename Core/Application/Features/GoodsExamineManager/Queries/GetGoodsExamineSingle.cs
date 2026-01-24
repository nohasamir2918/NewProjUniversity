using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using static Application.Features.GoodsExamineManager.Queries.GetGoodsExamineSingleProfile;

namespace Application.Features.GoodsExamineManager.Queries;


public class GetGoodsExamineSingleProfile : Profile
{
    public class GetGoodsExamineSingleDto
    {
        public string? Id { get; set; }
        public string? Number { get; set; }
        public DateTime? ExamineDate { get; set; }
        public DateTime? CommiteeDate { get; set; }
        public string? CommitteeDesionNumber { get; set; }
        public string? Description { get; set; }
        public string? PurchaseOrderId { get; set; }
        public string? PurchaseOrderNumber { get; set; }
        public DateTime? PurchaseOrderDate { get; set; }
        public string? VendorName { get; set; }
        
        public List<ExamineCommiteeDto> CommitteeList { get; set; } = new();
    }

    public GetGoodsExamineSingleProfile()
    {
        CreateMap<GoodsExamine, GetGoodsExamineSingleDto>()
    .ForMember(d => d.CommitteeList,
        o => o.MapFrom(s => s.Committees))
    .ForMember(d => d.PurchaseOrderNumber,
        o => o.MapFrom(s => s.PurchaseOrder.Number))
    .ForMember(d => d.PurchaseOrderDate,
        o => o.MapFrom(s => s.PurchaseOrder.OrderDate))
    .ForMember(d => d.VendorName,
        o => o.MapFrom(s => s.PurchaseOrder.Vendor.Name));


        CreateMap<ExamineCommitee, ExamineCommiteeDto>();
    }
}


public class GetGoodsExamineSingleResult
{
    public GetGoodsExamineSingleDto? Data { get; init; }
    public List<PurchaseOrderItem>? PurchaseOrder { get; init; }
}

public class GetGoodsExamineSingleRequest : IRequest<GetGoodsExamineSingleResult>
{
    public string? Id { get; init; }
}

public class GetGoodsExamineSingleValidator : AbstractValidator<GetGoodsExamineSingleRequest>
{
    public GetGoodsExamineSingleValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
public class GetGoodsExamineSingleHandler
    : IRequestHandler<GetGoodsExamineSingleRequest, GetGoodsExamineSingleResult>
{
    private readonly IQueryContext _context;
    private readonly IMapper _mapper;

    public GetGoodsExamineSingleHandler(
        IQueryContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<GetGoodsExamineSingleResult> Handle(
        GetGoodsExamineSingleRequest request,
        CancellationToken cancellationToken)
    {
        var entity = await _context
            .GoodsExamine
            .AsNoTracking()
            .Include(x => x.Committees)
            .Include(x => x.PurchaseOrder)
                .ThenInclude(x => x.Vendor)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity == null)
            return new GetGoodsExamineSingleResult();

        var dto = new GetGoodsExamineSingleDto
        {
            Id = entity.Id,
            Number = entity.Number,
            ExamineDate = entity.ExamineDate,
            CommiteeDate = entity.CommiteeDate,
            CommitteeDesionNumber = entity.CommitteeDesionNumber,
            PurchaseOrderNumber = entity.PurchaseOrder?.Number,
            PurchaseOrderDate = entity.PurchaseOrder?.OrderDate,
            VendorName = entity.PurchaseOrder?.Vendor?.Name,
            CommitteeList = _mapper
          .Map<List<ExamineCommiteeDto>>(entity.Committees
          .Where(c => !c.IsDeleted))  // ✅ هنا فلترة اللجان غير المحذوفة
          .ToList()
        };



        var PuchaseOrderItemList = await _context
            .PurchaseOrderItem
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Include(x => x.Product).Where(a=>a.PurchaseOrderId== entity.PurchaseOrderId)
          
            .ToListAsync(cancellationToken);

        return new GetGoodsExamineSingleResult
        {
            Data = dto,
            PurchaseOrder = PuchaseOrderItemList
        };
    }
}

