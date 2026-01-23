using Domain.Common;

namespace Domain.Entities;


public class Employee : BaseEntity
{
    public string? Name { get; set; }
    public string? Number { get; set; }
    public string? Description { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? PhoneNumber { get; set; }
    public string? FaxNumber { get; set; }
    public string? EmailAddress { get; set; }
    public string? Website { get; set; }
    public string? WhatsApp { get; set; }
    public string? LinkedIn { get; set; }
    public string? Facebook { get; set; }
    public string? Instagram { get; set; }
    public string? TwitterX { get; set; }
    public string? TikTok { get; set; }

    public string? DepartmentId { get; set; }
    public Department? Department { get; set; }
    public ICollection<IssueRequests> IssueRequestsList { get; set; } = new List<IssueRequests>();
    public ICollection<ItemReturnRequests> ItemReturnRequestsList { get; set; } = new List<ItemReturnRequests>();
}
