using Application.Common.Extensions;
using AutoMapper;
using Domain.Enums;
using MediatR;

namespace Application.Features.ItemReturnRequestsManager.Queries;

public record GetItemReturnRequestsStatusListDto
{
    public string? Id { get; init; }
    public string? Name { get; init; }
}

public class GetItemReturnRequestsStatusListProfile : Profile
{
    public GetItemReturnRequestsStatusListProfile()
    {
    }
}

public class GetItemReturnRequestsStatusListResult
{
    public List<GetItemReturnRequestsStatusListDto>? Data { get; init; }
}

public class GetItemReturnRequestsStatusListRequest : IRequest<GetItemReturnRequestsStatusListResult>
{
}


public class GetItemReturnRequestsStatusListHandler : IRequestHandler<GetItemReturnRequestsStatusListRequest, GetItemReturnRequestsStatusListResult>
{

    public GetItemReturnRequestsStatusListHandler()
    {
    }

    public async Task<GetItemReturnRequestsStatusListResult> Handle(GetItemReturnRequestsStatusListRequest request, CancellationToken cancellationToken)
    {
        var statuses = Enum.GetValues(typeof(SalesOrderStatus))
            .Cast<SalesOrderStatus>()
            .Select(status => new GetItemReturnRequestsStatusListDto
            {
                Id = ((int)status).ToString(),
                Name = status.ToFriendlyName()
            })
            .ToList();

        await Task.CompletedTask;

        return new GetItemReturnRequestsStatusListResult
        {
            Data = statuses
        };
    }


}



