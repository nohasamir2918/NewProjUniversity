ej.base.L10n.load({
    "ar": {
        "grid": {
            "EmptyRecord": "لا توجد بيانات",
            "True": "نعم",
            "False": "لا",
            "Add": "إضافة",
            "Edit": "تعديل",
            "Cancel": "إلغاء",
            "Update": "حفظ",
            "Delete": "حذف",
            "Print": "طباعة",
            "Pdfexport": "تصدير PDF",
            "Excelexport": "تصدير Excel",
            "Search": "بحث",
            "FilterButton": "تطبيق",
            "ClearButton": "مسح",
            "StartsWith": "يبدأ بـ",
            "EndsWith": "ينتهي بـ",
            "Contains": "يحتوي",
            "Equal": "يساوي",
            "NotEqual": "لا يساوي",
            "LessThan": "أقل من",
            "LessThanOrEqual": "أقل من أو يساوي",
            "GreaterThan": "أكبر من",
            "GreaterThanOrEqual": "أكبر من أو يساوي",
            "ChooseDate": "اختر التاريخ",
            "EnterValue": "أدخل القيمة",
            "GroupDropArea": "اسحب رأس العمود هنا للتجميع",
            "Ungroup": "إلغاء التجميع",
            "GroupDisable": "التجميع غير متاح لهذا العمود",
            "NoResult": "لا توجد نتائج مطابقة",
            "PagerInfo": "عرض {0} إلى {1} من {2} سجل",
            "All": "الكل",
            "PageSize": "عدد الصفوف",
            "CurrentPageInfo": "صفحة {0} من {1}",
            "TotalItemsInfo": "({0} عناصر)",
            "FirstPageTooltip": "الصفحة الأولى",
            "LastPageTooltip": "الصفحة الأخيرة",
            "NextPageTooltip": "التالي",
            "PreviousPageTooltip": "السابق",
            "ExcelExport": "تصدير Excel",
            "PdfExport": "تصدير PDF",
            "CsvExport": "تصدير CSV"
        },
        "pager": {
            "currentPageInfo": "صفحة {0} من {1}",
            "totalItemsInfo": "({0} سجل)",
            "firstPageTooltip": "الصفحة الأولى",
            "lastPageTooltip": "الصفحة الأخيرة",
            "nextPageTooltip": "التالي",
            "previousPageTooltip": "السابق",
            "pagerDropDown": "عدد الصفوف",
            "pagerAll": "الكل"
        }
    }
});


const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],

            departmentId: null,
            employeeId: null,
            productId: null,

            departmentList: [],
            employeeList: [],
            productList: [],

            errors: {
                departmentId: '',
                employeeId: '',
                productId: ''
            }
        });

        const mainGridRef = Vue.ref(null);
        const departmentRef = Vue.ref(null);
        const employeeRef = Vue.ref(null);
        const productRef = Vue.ref(null);

        const services = {
            getDepartmentLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Department/GetDepartmentList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getEmployeeLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Employee/GetEmployeeList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getProductLookupData: async (employeeId) => {
                try {
                    const response = await AxiosManager.post('/CustodyMonitoring/GetProductByEmployeeList', { employeeId });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getCustodyMonitoringList: async (employeeId, productId) => {
                try {
                    const params = { employeeId, productId };
                    console.log("params", params);
                    const response = await AxiosManager.post(
                        '/CustodyMonitoring/CustodyMonitoringList',
                        { employeeId, productId }
                    );
                    console.log("response", response);
                    return response;

                } catch (error) {
                    throw error;
                }
            }

        };

        const methods = {
            populateDepartmentLookupData: async () => {
                const response = await services.getDepartmentLookupData();
                state.departmentList =
                    response?.data?.content?.data && Array.isArray(response.data.content.data)
                        ? response.data.content.data
                        : [];
            },
            //populateEmployeeLookupData: async () => {
            //    const response = await services.getEmployeeLookupData();
            //    state.employeeList =
            //        response?.data?.content?.data && Array.isArray(response.data.content.data)
            //            ? response.data.content.data
            //            : [];
            //},
            //populateProductLookupData: async () => {
            //    const response = await services.getProductLookupData();
            //    state.productList =
            //        response?.data?.content?.data && Array.isArray(response.data.content.data)
            //            ? response.data.content.data
            //            : [];
            //},

        };

        const mainGrid = {
            obj: null,
            create: async (dataSource) => {
                mainGrid.obj = new ej.grids.Grid({
                    locale: "ar",
                    enableRtl: true,
                    height: '240px',
                    dataSource: dataSource,
                    allowFiltering: true,
                    allowSorting: true,
                    allowSelection: true,
                    allowGrouping: true,
                    allowTextWrap: true,
                    allowResizing: true,
                    allowPaging: true,
                    filterSettings: { type: 'CheckBox' },
                    pageSettings: { currentPage: 1, pageSize: 50, pageSizes: ["10", "20", "50", "100", "200", "الكل"] },
                    selectionSettings: { persistSelection: true, type: 'Single' },
                    autoFit: true,
                    showColumnMenu: true,
                    gridLines: 'Horizontal',

                    // ----- الأعمدة بعد التعريب -----
                    columns: [

                        { field: 'MovementDate', headerText: 'التاريخ', width: 200, minWidth: 200 },
                        { field: 'moduleNumber', headerText: 'رقم الإذن', width: 200, minWidth: 200 },
                        { field: 'moduleName', headerText: 'الحركة', width: 200, minWidth: 200 },
                        { field: 'warehouseName', headerText: 'وارد من/منصرف الى', width: 200, minWidth: 200 },
                        { field: 'movement', headerText: 'كمية مضافة/منصرفة', width: 200, minWidth: 200 },
                        { field: 'total', headerText: 'الرصيد', width: 200, minWidth: 200 },

                    ],

                    toolbar: [

                        { text: 'طباعة PDF', tooltipText: 'طباعة PDF', id: 'PrintPDFCustom' },
                    ],

                    dataBound: function () {
                        mainGrid.obj.autoFitColumns([
                            'moduleName',
                            'moduleNumber',
                            'warehouseName',
                            'movement',
                            'total'

                        ]);
                    },

                    rowSelecting: () => {
                        if (mainGrid.obj.getSelectedRecords().length) {
                            mainGrid.obj.clearSelection();
                        }
                    },

                    toolbarClick: async (args) => {

                        if (args.item.id === 'PrintPDFCustom') {
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                window.open('/GoodsReceives/GoodsReceivePdf?id=' + (selectedRecord.id ?? ''), '_blank');
                            }
                        }
                    }

                });

                mainGrid.obj.appendTo(mainGridRef.value);
            },

            refresh: () => {
                mainGrid.obj.setProperties({ dataSource: state.mainData });
            }
        };

        const departmentLookup = {
            obj: null,
            create: () => {
                if (Array.isArray(state.departmentList)) {
                    departmentLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.departmentList,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'اختار الإدارة',
                        allowFiltering: true,
                        filtering: (e) => {
                            e.preventDefaultAction = true;
                            let query = new ej.data.Query();
                            if (e.text) {
                                query = query.where('name', 'startsWith', e.text, true);
                            }
                            e.updateData(state.departmentList, query);
                        },
                        change: (e) => {
                            state.departmentId = e.value;
                        }
                    });
                    departmentLookup.obj.appendTo(departmentRef.value);
                }
            }
        };

        const employeeLookup = {
            obj: null,
            create: () => {
                if (Array.isArray(state.employeeList)) {
                    employeeLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.employeeList,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'اختار الموظف',
                        allowFiltering: true,
                        filtering: (e) => {
                            e.preventDefaultAction = true;
                            let query = new ej.data.Query();
                            if (e.text) {
                                query = query.where('name', 'contains', e.text, true);
                            }
                            e.updateData(state.employeeList, query);
                        },
                        change: (e) => {
                            state.employeeId = e.value;
                        }
                    });
                    employeeLookup.obj.appendTo(employeeRef.value);
                }
            }
        };

        const productLookup = {
            obj: null,
            create: () => {
                if (Array.isArray(state.productList)) {
                    productLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.productList,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'اختار الصنف',
                        allowFiltering: true,
                        filtering: (e) => {
                            e.preventDefaultAction = true;
                            let query = new ej.data.Query();
                            if (e.text) {
                                query = query.where('name', 'contains', e.text, true);
                            }
                            e.updateData(state.productList, query);
                        },
                        change: (e) => {
                            state.productId = e.value;
                        }
                    });
                    productLookup.obj.appendTo(productRef.value);
                }
            }
        };

        Vue.watch(
            () => state.departmentId,
            async (newVal) => {
                if (!newVal) return;

                const response = await services.getEmployeeLookupData();

                state.employeeList =
                    response?.data?.content?.data && Array.isArray(response.data.content.data)
                        ? response.data.content.data
                        : [];

                if (employeeLookup.obj) {
                    const filtered = state.employeeList.filter(e => e.departmentId === newVal);
                    employeeLookup.obj.dataSource = filtered;
                    employeeLookup.obj.value = null;
                    state.employeeId = null;
                }
            }
        );

        Vue.watch(
            () => state.employeeId,
            async (newVal) => {
                if (!newVal) {
                    state.productList = [];
                    if (productLookup.obj) {
                        productLookup.obj.dataSource = [];
                        productLookup.obj.value = null;
                    }
                    return;
                }

                const response = await services.getProductLookupData(newVal);

                state.productList =
                    response?.data?.content?.data && Array.isArray(response.data.content.data)
                        ? response.data.content.data
                        : [];

                if (productLookup.obj) {
                    productLookup.obj.dataSource = state.productList;
                    productLookup.obj.value = null;
                }
            }
        );

        Vue.watch(() => state.productId, async (newProductId) => {
            if (!newProductId) {
                state.mainData = []; // لو مسح الاختيار
                return;
            }

            if (!state.employeeId) {
                alert("يجب اختيار الموظف أولاً!");
                state.productId = null; // ترجّع الـ dropdown فاضي
                return;
            }

            try {
                console.log(newProductId);
                console.log(state.employeeId);
                const res = await services.getCustodyMonitoringList(
                    state.employeeId,
                    newProductId
                );
                state.mainData = res?.data?.content?.data ?? [];
                mainGrid.refresh();
            } catch (e) {
                console.error(e);
                state.mainData = [];
            }
        });

        Vue.watch(() => state.employeeId, () => {
            if (!state.employeeId && state.productId) {
                state.mainData = [];
                state.productId = null; // لازم يعيد اختيار المنتج
            }
        });

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['CustodyMonitoring']);
                await SecurityManager.validateToken();
                await methods.populateDepartmentLookupData();
                // await methods.populateEmployeeLookupData();
                // await methods.populateProductLookupData();
                await mainGrid.create(state.mainData);
                departmentLookup.create();
                employeeLookup.create();
                productLookup.create();
            } catch (e) {
                console.error('خطأ في تحميل الصفحة:', e);
            }
        });

        return {
            mainGridRef,
            state,
            departmentRef,
            employeeRef,
            productRef
        };
    }
};

Vue.createApp(App).mount('#app');
