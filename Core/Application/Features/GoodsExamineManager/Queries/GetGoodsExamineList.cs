using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.GoodsExamineManager.Queries;

public record GetGoodsExamineListDto
{
    public string? Id { get; init; }
    public string? Number { get; init; }
    public DateTime? ExamineDate { get; init; }
    public GoodsExamineStatus? Status { get; init; }
    public string? StatusName { get; init; }
    public string? Description { get; init; }
    public string? PurchaseOrderId { get; init; }
    public string? PurchaseOrderNumber { get; init; }
    public DateTime? CreatedAtUtc { get; init; }
    public DateTime? CommiteeDate { get; set; }
    public string? CommitteeDesionNumber { get; set; }

    // ✅ لازم List
    public List<ExamineCommiteeDto> committeeList { get; init; } = new();
}
public class ExamineCommiteeDto
{
    public string? Id { get; set; }
    public int? EmployeeID { get; init; }
    public int? EmployeePositionID { get; init; }
    public string? EmployeeName { get; init; }
    public string? EmployeePositionName { get; init; }
    public bool? EmployeeType { get; init; }
    public string? Description { get; init; }
    public bool IsDeleted { get; set; } = false;
}

public class GetGoodsExamineListProfile : Profile
{
    public GetGoodsExamineListProfile()
    {
        CreateMap<GoodsExamine, GetGoodsExamineListDto>()
     .ForMember(
         dest => dest.PurchaseOrderNumber,
         opt => opt.MapFrom(src => src.PurchaseOrder != null ? src.PurchaseOrder.Number : string.Empty)
     )
     .ForMember(
         dest => dest.StatusName,
         opt => opt.MapFrom(src => src.Status.HasValue ? src.Status.Value.ToFriendlyName() : string.Empty)
     )
     .ForMember(
         dest => dest.committeeList,
         opt => opt.MapFrom(src => src.Committees) // ✅ تحويل القائمة إلى DTO
     );

        CreateMap<ExamineCommitee, ExamineCommiteeDto>();


    }
}

public class GetGoodsExamineListResult
{
    public List<GetGoodsExamineListDto>? Data { get; init; }
}

public class GetGoodsExamineListRequest : IRequest<GetGoodsExamineListResult>
{
    public bool IsDeleted { get; init; } = false;
}


public class GetGoodsExamineListHandler : IRequestHandler<GetGoodsExamineListRequest, GetGoodsExamineListResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public GetGoodsExamineListHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<GetGoodsExamineListResult> Handle(GetGoodsExamineListRequest request, CancellationToken cancellationToken)
    
    {
        var query = _context
            .GoodsExamine
            .AsNoTracking()
            .ApplyIsDeletedFilter(request.IsDeleted)
            
            .Include(x => x.PurchaseOrder)
            .Include(x => x.Committees).Where(x=>x.IsDeleted==false) // ✅ جلب جميع اللجان

            .AsQueryable();

        var entities = await query.ToListAsync(cancellationToken);
        // فلترة اللجان على IsDeleted = false
        foreach (var entity in entities)
        {
            entity.Committees = entity.Committees
                .Where(c => !c.IsDeleted)
                .ToList();
        }
        var dtos = _mapper.Map<List<GetGoodsExamineListDto>>(entities);

        return new GetGoodsExamineListResult
        {
            Data = dtos
        };
    }


}



