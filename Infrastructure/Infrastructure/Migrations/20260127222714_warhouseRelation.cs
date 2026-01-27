using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class warhouseRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "WarehouseId",
                table: "IssueRequests",
                type: "nvarchar(50)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_IssueRequests_WarehouseId",
                table: "IssueRequests",
                column: "WarehouseId");

            migrationBuilder.AddForeignKey(
                name: "FK_IssueRequests_Warehouse_WarehouseId",
                table: "IssueRequests",
                column: "WarehouseId",
                principalTable: "Warehouse",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IssueRequests_Warehouse_WarehouseId",
                table: "IssueRequests");

            migrationBuilder.DropIndex(
                name: "IX_IssueRequests_WarehouseId",
                table: "IssueRequests");

            migrationBuilder.AlterColumn<string>(
                name: "WarehouseId",
                table: "IssueRequests",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldNullable: true);
        }
    }
}
