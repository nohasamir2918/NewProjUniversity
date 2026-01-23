using Application.Common.Extensions;
using Application.Common.Repositories;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ItemReturnRequestsManager;

public class ItemReturnRequestsService
{
    private readonly ICommandRepository<ItemReturnRequests> _ItemReturnRequestsRepository;

    private readonly IUnitOfWork _unitOfWork;

    public ItemReturnRequestsService(
        ICommandRepository<ItemReturnRequests> ItemReturnRequestsRepository,

        IUnitOfWork unitOfWork
        )
    {
        _ItemReturnRequestsRepository = ItemReturnRequestsRepository;

        _unitOfWork = unitOfWork;
    }

    public void Recalculate(string ItemReturnRequestsId)
    {
        var ItemReturnRequests = _ItemReturnRequestsRepository
            .GetQuery()
            .ApplyIsDeletedFilter()
            .Where(x => x.Id == ItemReturnRequestsId)
            .Include(x => x.Product)
            .Include(x => x.Employee)
            .SingleOrDefault();

        if (ItemReturnRequests == null)
            return;



        _ItemReturnRequestsRepository.Update(ItemReturnRequests);
        _unitOfWork.Save();
    }
}
