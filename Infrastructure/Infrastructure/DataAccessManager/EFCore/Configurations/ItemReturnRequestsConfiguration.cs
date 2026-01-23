using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using static Domain.Common.Constants;

namespace Infrastructure.DataAccessManager.EFCore.Configurations;

public class ItemReturnRequestsConfiguration : BaseEntityConfiguration<ItemReturnRequests>
{
    public override void Configure(EntityTypeBuilder<ItemReturnRequests> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.Number).HasMaxLength(CodeConsts.MaxLength).IsRequired(false);
        builder.Property(x => x.OrderDate).IsRequired(false);
        builder.Property(x => x.OrderStatus).IsRequired(false);
        builder.Property(x => x.ProductStatus).IsRequired(false);
        builder.Property(x => x.CommitteeDecision).HasMaxLength(DescriptionConsts.MaxLength).IsRequired(false);
        builder.Property(x => x.EmployeeId).HasMaxLength(IdConsts.MaxLength).IsRequired(false);
        builder.Property(x => x.ProductId).HasMaxLength(IdConsts.MaxLength).IsRequired(false);
        builder.Property(x => x.UnitPrice).IsRequired(false);
        builder.Property(x => x.Quantity).IsRequired(false);

        builder.HasIndex(e => e.Number);
    }
}

