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

            warehouseList: [],

            warehouseId: null,

            errors: {
                warehouseId: '',
            }
        });

        const mainGridRef = Vue.ref(null);
        const warehouseRef = Vue.ref(null);

        const services = {

            getWarehouseLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Warehouse/GetWarehouseList', {});
                    return response;
                }
                catch (error) {
                    throw error;
                }
            },
            getStockForWarehouseData: async (warehouseId) => {
                try {
                    const response = await AxiosManager.post('/InventoryStocktaking/GetStockForWarehouseList', { warehouseId });
                    return response;
                }
                catch (error) {
                    throw error;
                }
            },
        };

        const methods = {
            populateWarehouseLookupData: async () => {
                const response = await services.getWarehouseLookupData();
                const list = response?.data?.content?.data && Array.isArray(response.data.content.data)
                    ? response.data.content.data
                    : [];
                state.warehouseList = list.filter(w => w.systemWarehouse !== false);
            },

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
                    columns:
                        [
                            { field: 'number', headerText: 'رقم الصنف', width: 200, minWidth: 200 },
                            { field: 'name', headerText: 'اسم الصنف', width: 200, minWidth: 200 },
                            { field: 'unitMeasureName', headerText: 'الوحدة', width: 200, minWidth: 200 },
                            { field: 'quantity', headerText: 'الرصيد الدفتري', width: 200, minWidth: 200 },
                            { field: 'unitPrice', headerText: 'سعر الوحدة', width: 200, minWidth: 200 },
                            {
                                field: 'total', headerText: 'القيمة', width: 200, minWidth: 200,
                                valueAccessor: (field, data) => {
                                    const qty = Number(data.quantity ?? 0);
                                    const price = Number(data.unitPrice ?? 0);
                                    return qty * price;
                                }
                            },
                        ],
                    toolbar: [

                        { text: 'طباعة PDF', tooltipText: 'طباعة PDF', id: 'PrintPDFCustom' },
                    ],
                    dataBound: function () {
                        mainGrid.obj.autoFitColumns([
                            'number',
                            'name',
                            'unitMeasureName',
                            'quantity',
                            'unitPrice',
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

        const warehouseLookup = {
            obj: null,
            create: () => {
                if (Array.isArray(state.warehouseList)) {
                    warehouseLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.warehouseList,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'اختار المخزن',
                        allowFiltering: true,
                        filtering: (e) => {
                            e.preventDefaultAction = true;
                            let query = new ej.data.Query();
                            if (e.text) {
                                query = query.where('name', 'startsWith', e.text, true);
                            }
                            e.updateData(state.warehouseList, query);
                        },
                        change: (e) => {
                            state.warehouseId = e.value;
                        }
                    });
                    warehouseLookup.obj.appendTo(warehouseRef.value);
                }
            }
        };

        Vue.watch(() => state.warehouseId, async (newWarehouseId) => {
            if (!newWarehouseId) {
                state.mainData = []; // لو مسح الاختيار
                return;
            }

            try {
                console.log(newWarehouseId);

                const res = await services.getStockForWarehouseData(

                    newWarehouseId
                );
                state.mainData = res?.data?.content?.data ?? [];
                mainGrid.refresh();
            }
            catch (e) {
                console.error(e);
                state.mainData = [];
            }
        });

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['InventoryStocktaking']);
                await SecurityManager.validateToken();
                await methods.populateWarehouseLookupData();
                await mainGrid.create(state.mainData);
                warehouseLookup.create();
            }
            catch (e) {
                console.error('خطأ في تحميل الصفحة:', e);
            }
        });

        return {
            mainGridRef,
            state,
            warehouseRef,
        }
    }
};

Vue.createApp(App).mount('#app');
