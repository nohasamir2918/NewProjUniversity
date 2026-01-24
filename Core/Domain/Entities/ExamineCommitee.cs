using Domain.Common;
using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class ExamineCommitee: BaseEntity
    {
        public string? Number { get; set; }
     
        public GoodsExamine? GoodsExamine { get; set; }
     
        public int? EmployeeID { get; set; }
        public int? EmployeePositionID { get; set; }
        public string? EmployeeName { get; set; }
        public string? EmployeePositionName { get; set; }
        public bool? EmployeeType { get; set; }
        public string? Description { get; set; }
        public string? GoodsExamineId { get; set; }
        
        public ICollection<ExamineCommitee> Committees { get; set; } = new List<ExamineCommitee>();

    }
}
