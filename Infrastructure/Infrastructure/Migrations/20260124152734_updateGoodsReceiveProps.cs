using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class updateGoodsReceiveProps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ReturnRequestId",
                table: "GoodsReceive",
                type: "nvarchar(50)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WarehouseToId",
                table: "GoodsReceive",
                type: "nvarchar(50)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceive_ReturnRequestId",
                table: "GoodsReceive",
                column: "ReturnRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_GoodsReceive_WarehouseToId",
                table: "GoodsReceive",
                column: "WarehouseToId");

            migrationBuilder.AddForeignKey(
                name: "FK_GoodsReceive_ItemReturnRequests_ReturnRequestId",
                table: "GoodsReceive",
                column: "ReturnRequestId",
                principalTable: "ItemReturnRequests",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_GoodsReceive_Warehouse_WarehouseToId",
                table: "GoodsReceive",
                column: "WarehouseToId",
                principalTable: "Warehouse",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GoodsReceive_ItemReturnRequests_ReturnRequestId",
                table: "GoodsReceive");

            migrationBuilder.DropForeignKey(
                name: "FK_GoodsReceive_Warehouse_WarehouseToId",
                table: "GoodsReceive");

            migrationBuilder.DropIndex(
                name: "IX_GoodsReceive_ReturnRequestId",
                table: "GoodsReceive");

            migrationBuilder.DropIndex(
                name: "IX_GoodsReceive_WarehouseToId",
                table: "GoodsReceive");

            migrationBuilder.DropColumn(
                name: "WarehouseToId",
                table: "GoodsReceive");

            migrationBuilder.AlterColumn<string>(
                name: "ReturnRequestId",
                table: "GoodsReceive",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldNullable: true);
        }
    }
}
