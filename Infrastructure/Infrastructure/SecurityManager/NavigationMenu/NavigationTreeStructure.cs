using Application.Common.Services.SecurityManager;
using System.Text.Json;

namespace Infrastructure.SecurityManager.NavigationMenu
{
    public class JsonStructureItem
    {
        public string? URL { get; set; }
        public string? Name { get; set; }
        public bool IsModule { get; set; }
        public List<JsonStructureItem> Children { get; set; } = new List<JsonStructureItem>();
    }

    public static class NavigationTreeStructure
    {
        public static readonly string JsonStructure = """
        [
            {
                "URL": "#",
                "Name": "لوحات التحكم",
                "IsModule": true,
                "Children": [
                    {
                        "URL": "/Dashboards/DefaultDashboard",
                        "Name": "الافتراضية",
                        "IsModule": false
                    }
                ]
            },
           
            {
                "URL": "#",
                "Name": "الموردين",
                "IsModule": true,
                "Children": [
                    {
                        "URL": "/VendorGroups/VendorGroupList",
                        "Name": "مجموعات الموردين",
                        "IsModule": false
                    },
                    {
                        "URL": "/VendorCategories/VendorCategoryList",
                        "Name": "تصنيفات الموردين",
                        "IsModule": false
                    },
                    {
                        "URL": "/Vendors/VendorList",
                        "Name": "الموردين",
                        "IsModule": false
                    },
                    {
                        "URL": "/VendorContacts/VendorContactList",
                        "Name": "جهات اتصال الموردين",
                        "IsModule": false
                    },
                    {
                       "URL": "/Employee/EmployeeList",
                       "Name": " الموظفين ",
                       "IsModule": false
                    },
                    {
                       "URL": "/Department/DepartmentList",
                       "Name": " الادارة ",
                       "IsModule": false
                    }
                    
                ]
            },
        
            {
                "URL": "#",
                "Name": "المنتجات",
                "IsModule": true,
                "Children": [
                    {
                        "URL": "/UnitMeasures/UnitMeasureList",
                        "Name": "وحدات القياس",
                        "IsModule": false
                    },
                    {
                        "URL": "/ProductGroups/ProductGroupList",
                        "Name": "مجموعات المنتجات",
                        "IsModule": false
                    },
                    {
                        "URL": "/Products/ProductList",
                        "Name": "المنتجات",
                        "IsModule": false
                    }
                   
                ]
            },

        {
                "URL": "#",
                "Name": "اوامر الشغل",
                "IsModule": true,
                "Children": [  
         {
                        "URL": "/PurchaseOrders/PurchaseOrderList",
                        "Name": "أوامر التوريد",
                        "IsModule": false
                    },
      
               
                    {
                        "URL": "/PurchaseReports/PurchaseReportList",
                        "Name": "تقارير أوامر التوريد",
                        "IsModule": false
                    },
        {
            "URL": "/GoodsExamine/GoodsExamineList",
            "Name": "فحص  ",
            "IsModule": false
        },
        {
            "URL": "/GoodsReceives/GoodsReceiveList",
            "Name": "اذن الاضافة ",
            "IsModule": false
        },
        {
            "URL": "/GoodsReceives/GoodsReceiveList",
            "Name": "اذن الاضافة ",
            "IsModule": false
        },
         {
            "URL": "/ItemReturnRequests/ItemReturnRequestsList",
            "Name": "طلب مرتجع ",
            "IsModule": false
        },
         {
            "URL": "/CustodyMonitoring/CustodyMonitoring",
            "Name": "مراقبة عهدة",
            "IsModule": false
        },
         
                    {
                        "URL": "/Reports/ScrappingReport",
                        "Name": "دفتر الشطب",
                        "IsModule": false
                    },
                    {
                        "URL": "/StockCounts/StockCountList",
                        "Name": "جرد المخزون",
                        "IsModule": false
                    }
                ]
            },
            
            {
                "URL": "#",
                "Name": "الملفات الشخصية",
                "IsModule": true,
                "Children": [
                    {
                        "URL": "/Profiles/MyProfile",
                        "Name": "ملفي الشخصي",
                        "IsModule": false
                    }
                ]
            }
            
        ]
        """;
        //, {
        //    "URL": "/StockCounts/StockCountList",
        //    "Name": "جرد المخزون",
        //    "IsModule": false
        //}
        public static List<MenuNavigationTreeNodeDto> GetCompleteMenuNavigationTreeNode()
        {
            var json = JsonStructure;
            var menus = JsonSerializer.Deserialize<List<JsonStructureItem>>(json);

            List<MenuNavigationTreeNodeDto> nodes = new List<MenuNavigationTreeNodeDto>();
            var index = 1;

            void AddNodes(List<JsonStructureItem> menuItems, string? parentId = null)
            {
                foreach (var item in menuItems)
                {
                    var nodeId = index.ToString();
                    if (item.IsModule)
                    {
                        nodes.Add(new MenuNavigationTreeNodeDto(nodeId, item.Name ?? "", param_hasChild: true, param_expanded: false));
                    }
                    else
                    {
                        nodes.Add(new MenuNavigationTreeNodeDto(nodeId, item.Name ?? "", parentId, item.URL));
                    }

                    index++;

                    if (item.Children != null && item.Children.Count > 0)
                    {
                        AddNodes(item.Children, nodeId);
                    }
                }
            }

            if (menus != null) AddNodes(menus);

            return nodes;
        }

        public static string GetFirstSegmentFromUrlPath(string? path)
        {
            var result = string.Empty;
            if (path != null && path.Contains("/"))
            {
                string[] parts = path.Split("/");
                if (parts.Length > 2)
                {
                    result = parts[1];
                }
            }
            return result;
        }

        public static List<string> GetCompleteFirstMenuNavigationSegment()
        {
            var json = JsonStructure;
            var menus = JsonSerializer.Deserialize<List<JsonStructureItem>>(json);
            var result = new List<string>();

            if (menus != null)
            {
                foreach (var item in menus)
                {
                    ProcessMenuItem(item, result);
                }
            }

            return result;
        }

        private static void ProcessMenuItem(JsonStructureItem item, List<string> result)
        {
            if (!string.IsNullOrEmpty(item.URL) && item.URL != "#")
            {
                var segment = GetFirstSegmentFromUrlPath(item.URL);
                if (!string.IsNullOrEmpty(segment) && !result.Contains(segment))
                {
                    result.Add(segment);
                }
            }

            if (item.Children != null)
            {
                foreach (var child in item.Children)
                {
                    ProcessMenuItem(child, result);
                }
            }
        }
    }
}
