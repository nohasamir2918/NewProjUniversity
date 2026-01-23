ej.base.L10n.load({
    'ar': {
        'grid': {
            'EmptyRecord': 'لا توجد بيانات للعرض',
            'GroupDropArea': 'اسحب عنوان العمود هنا لتجميع البيانات',
            'UnGroup': 'اضغط لإلغاء التجميع',
            'Item': 'عنصر',
            'Items': 'عناصر',
            'Edit': 'تعديل',
            'Delete': 'حذف',
            'Update': 'تحديث',
            'Cancel': 'إلغاء',
            'Search': 'بحث',
            'Save': 'حفظ',
            'Close': 'إغلاق',
            'ExcelExport': 'تصدير إكسل',
            'AddVendorCategory': 'إضافة فئة موردين',
            "FilterButton": "تطبيق",
            "ClearButton": "مسح",
            "StartsWith": " يبدأ بـ ",
            "EndsWith": " ينتهي بـ ",
            "Contains": " يحتوي على ",
            "Equal": " يساوي ",
            "NotEqual": " لا يساوي ",
            "LessThan": " أصغر من ",
            "LessThanOrEqual": " أصغر أو يساوي ",
            "GreaterThan": " أكبر من ",
            "GreaterThanOrEqual": " أكبر أو يساوي "
        },
        'pager': {
            'currentPageInfo': 'صفحة {0} من {1}',
            'firstPageTooltip': 'الصفحة الأولى',
            'lastPageTooltip': 'الصفحة الأخيرة',
            'nextPageTooltip': 'الصفحة التالية',
            'previousPageTooltip': 'الصفحة السابقة',
            'nextPagerTooltip': 'التالي',
            'previousPagerTooltip': 'السابق',
            'totalItemsInfo': '({0} عناصر)'
        }
    }
});
const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            purchaseOrderListLookupData: [],
            goodsReceiveStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            warehouseListLookupData: [],
            mainTitle: null,
            id: '',
            number: '',
            receiveDate: '',
            description: '',
            purchaseOrderId: null,
            status: null,
            errors: {
                receiveDate: '',
                purchaseOrderId: '',
                status: '',
                description: ''
            },
            showComplexDiv: false,
            isSubmitting: false,
            totalMovementFormatted: '0.00'
        });

        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const secondaryGridRef = Vue.ref(null);
        const receiveDateRef = Vue.ref(null);
        const purchaseOrderIdRef = Vue.ref(null);
        const statusRef = Vue.ref(null);
        const numberRef = Vue.ref(null);

        const validateForm = function () {
            state.errors.receiveDate = '';
            state.errors.purchaseOrderId = '';
            state.errors.status = '';

            let isValid = true;

            if (!state.receiveDate) {
                state.errors.receiveDate = 'Receive date is required.';
                isValid = false;
            }
            if (!state.purchaseOrderId) {
                state.errors.purchaseOrderId = 'Purchase Order is required.';
                isValid = false;
            }
            if (!state.status) {
                state.errors.status = 'Status is required.';
                isValid = false;
            }

            return isValid;
        };

        const resetFormState = () => {
            state.id = '';
            state.number = '';
            state.receiveDate = '';
            state.description = '';
            state.purchaseOrderId = null;
            state.status = null;
            state.errors = {
                receiveDate: '',
                purchaseOrderId: '',
                status: '',
                description: ''
            };
            state.secondaryData = [];
        };

        const receiveDatePicker = {
            obj: null,
            create: () => {
                receiveDatePicker.obj = new ej.calendars.DatePicker({
                    placeholder: 'اختر التاريخ',
                    format: 'yyyy-MM-dd',
                    value: state.receiveDate ? new Date(state.receiveDate) : null,
                    change: (e) => {
                        state.receiveDate = e.value;
                    }
                });
                receiveDatePicker.obj.appendTo(receiveDateRef.value);
            },
            refresh: () => {
                if (receiveDatePicker.obj) {
                    receiveDatePicker.obj.value = state.receiveDate ? new Date(state.receiveDate) : null;
                }
            }
        };

        Vue.watch(
            () => state.receiveDate,
            (newVal, oldVal) => {
                receiveDatePicker.refresh();
                state.errors.receiveDate = '';
            }
        );

        const numberText = {
            obj: null,
            create: () => {
                numberText.obj = new ej.inputs.TextBox({
                    placeholder: '[auto]',
                });
                numberText.obj.appendTo(numberRef.value);
            }
        };

        const purchaseOrderListLookup = {
            obj: null,
            create: () => {
                if (state.purchaseOrderListLookupData && Array.isArray(state.purchaseOrderListLookupData)) {
                    purchaseOrderListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.purchaseOrderListLookupData,
                        fields: { value: 'id', text: 'number' },
                        placeholder: 'اختر امر التوريد',
                        filterBarPlaceholder: 'Search',
                        sortOrder: 'Ascending',
                        allowFiltering: true,
                        filtering: (e) => {
                            e.preventDefaultAction = true;
                            let query = new ej.data.Query();
                            if (e.text !== '') {
                                query = query.where('number', 'startsWith', e.text, true);
                            }
                            e.updateData(state.purchaseOrderListLookupData, query);
                        },
                        change: (e) => {
                            state.purchaseOrderId = e.value;
                        }
                    });
                    purchaseOrderListLookup.obj.appendTo(purchaseOrderIdRef.value);
                }
            },
            refresh: () => {
                if (purchaseOrderListLookup.obj) {
                    purchaseOrderListLookup.obj.value = state.purchaseOrderId
                }
            },
        };

        Vue.watch(
            () => state.purchaseOrderId,
            async (newVal) => {
                purchaseOrderListLookup.refresh();
                state.errors.purchaseOrderId = '';

                if (newVal) {
                    await methods.populateProductListByPurchaseOrder(newVal);
                    secondaryGrid.refresh();
                } else {
                    state.productListLookupData = [];
                }
            }
        );



        const goodsReceiveStatusListLookup = {
            obj: null,
            create: () => {
                if (state.goodsReceiveStatusListLookupData && Array.isArray(state.goodsReceiveStatusListLookupData)) {
                    goodsReceiveStatusListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.goodsReceiveStatusListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'اختر الحالة',
                        allowFiltering: false,
                        change: (e) => {
                            state.status = e.value;
                        }
                    });
                    goodsReceiveStatusListLookup.obj.appendTo(statusRef.value);
                }
            },
            refresh: () => {
                if (goodsReceiveStatusListLookup.obj) {
                    goodsReceiveStatusListLookup.obj.value = state.status
                }
            },
        };

        Vue.watch(
            () => state.status,
            (newVal, oldVal) => {
                goodsReceiveStatusListLookup.refresh();
                state.errors.status = '';
            }
        );

        const services = {
            getMainData: async () => {
                try {
                    const response = await AxiosManager.get('/GoodsReceive/GetGoodsReceiveList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createMainData: async (receiveDate, description, status, purchaseOrderId, createdById) => {
                try {
                    const response = await AxiosManager.post('/GoodsReceive/CreateGoodsReceive', {
                        receiveDate, description, status, purchaseOrderId, createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateMainData: async (id, receiveDate, description, status, purchaseOrderId, updatedById) => {
                try {
                    const response = await AxiosManager.post('/GoodsReceive/UpdateGoodsReceive', {
                        id, receiveDate, description, status, purchaseOrderId, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteMainData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/GoodsReceive/DeleteGoodsReceive', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getPurchaseOrderListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/PurchaseOrder/GetPurchaseOrderList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getGoodsReceiveStatusListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/GoodsReceive/GetGoodsReceiveStatusList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getSecondaryData: async (moduleId) => {
                try {
                    const response = await AxiosManager.get('/InventoryTransaction/GoodsReceiveGetInvenTransList?moduleId=' + moduleId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getPurchaseOrderItems: async (purchaseOrderId) => {
                try {
                    const response = await AxiosManager.get(
                        '/PurchaseOrderItem/GetPurchaseOrderItemByPurchaseOrderIdList?purchaseOrderId=' + purchaseOrderId
                    );
                    return response;
                } catch (error) {
                    throw error;
                }
            },

            createSecondaryData: async (moduleId, warehouseId, productId, movement, createdById, purchaseOrderItemId) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/GoodsReceiveCreateInvenTrans', {
                        moduleId, warehouseId, productId, movement, createdById, purchaseOrderItemId
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateSecondaryData: async (id, warehouseId, productId, movement, updatedById, purchaseOrderItemId) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/GoodsReceiveUpdateInvenTrans', {
                        id, warehouseId, productId, movement, updatedById, purchaseOrderItemId
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteSecondaryData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/InventoryTransaction/GoodsReceiveDeleteInvenTrans', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getProductListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Product/GetProductList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getWarehouseListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Warehouse/GetWarehouseList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
        };

        const methods = {
            populateMainData: async () => {
                const response = await services.getMainData();
                state.mainData = response?.data?.content?.data.map(item => ({
                    ...item,
                    receiveDate: new Date(item.receiveDate),
                    createdAtUtc: new Date(item.createdAtUtc)
                }));
            },
            populatePurchaseOrderListLookupData: async () => {
                const response = await services.getPurchaseOrderListLookupData();
                const purchaseOrders = response?.data?.content?.data || [];

                const filteredOrders = [];

                for (const po of purchaseOrders) {
                    const itemsRes = await services.getPurchaseOrderItems(po.id);

                    const hasAcceptedItem =
                        itemsRes?.data?.content?.data?.some(
                            item => item.itemStatus === true
                        );

                    if (hasAcceptedItem) {
                        filteredOrders.push(po);
                    }
                }

                state.purchaseOrderListLookupData = filteredOrders;
            },

            populateGoodsReceiveStatusListLookupData: async () => {
                const response = await services.getGoodsReceiveStatusListLookupData();
                state.goodsReceiveStatusListLookupData = response?.data?.content?.data;
            },
            populateProductListLookupData: async () => {
                const response = await services.getProductListLookupData();
                state.productListLookupData = response?.data?.content?.data
                    .filter(product => product.physical === true)
                    .map(product => ({
                        ...product,
                        numberName: `${product.productNumber} - ${product.productName}`
                    })) || [];
            },
            populateWarehouseListLookupData: async () => {
                const response = await services.getWarehouseListLookupData();
                state.warehouseListLookupData = response?.data?.content?.data.filter(warehouse => warehouse.systemWarehouse === false) || [];
            },
            populateProductListByPurchaseOrder: async (purchaseOrderId) => {
                const response = await services.getPurchaseOrderItems(purchaseOrderId);
                const items = response?.data?.content?.data || [];

                state.productListLookupData = items
                    .filter(x => x.itemStatus === true) // ✅ المقبول فقط
                    .map(x => {
                        const product = state.productListLookupData.find(
                            p => p.id === x.productId
                        );

                        return {
                            id: x.productId,                 // للـ Grid
                            purchaseOrderItemId: x.id,       // ⭐ المهم
                            unitPrice: x.unitPrice || 0,     // ⭐ السعر
                            numberName: `${x.productNumber} - ${x.productName}`
                        };

                    });
            },



            populateSecondaryData: async (goodsReceiveId) => {
                try {
                    const response = await services.getSecondaryData(goodsReceiveId);
                    state.secondaryData = response?.data?.content?.data.map(item => ({
                        ...item,
                        createdAtUtc: new Date(item.createdAtUtc)
                    }));
                    methods.refreshSummary();
                } catch (error) {
                    state.secondaryData = [];
                }
            },
            refreshSummary: () => {
                const totalMovement = state.secondaryData.reduce((sum, record) => sum + (record.movement ?? 0), 0);
                state.totalMovementFormatted = NumberFormatManager.formatToLocale(totalMovement);
            },
            onMainModalHidden: () => {
                state.errors.receiveDate = '';
                state.errors.purchaseOrderId = '';
                state.errors.status = '';
            }
        };

        const handler = {
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));

                    if (!validateForm()) {
                        return;
                    }

                    const response = state.id === ''
                        ? await services.createMainData(state.receiveDate, state.description, state.status, state.purchaseOrderId, StorageManager.getUserId())
                        : state.deleteMode
                            ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(state.id, state.receiveDate, state.description, state.status, state.purchaseOrderId, StorageManager.getUserId());

                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            state.mainTitle = 'Edit Goods Receive';
                            state.id = response?.data?.content?.data.id ?? '';
                            state.number = response?.data?.content?.data.number ?? '';
                            await methods.populateSecondaryData(state.id);
                            secondaryGrid.refresh();
                            state.showComplexDiv = true;

                            Swal.fire({
                                icon: 'success',
                                title: 'تم الحفظ',
                                timer: 2000,
                                showConfirmButton: false
                            });

                        } else {
                            Swal.fire({
                                icon: 'success',
                                title: 'تم الحذف',
                                text: 'الاغلاق من هنا...',
                                timer: 2000,
                                showConfirmButton: false
                            });
                            setTimeout(() => {
                                mainModal.obj.hide();
                                resetFormState();
                            }, 2000);
                        }

                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: state.deleteMode ? 'فشل الحذف' : 'فشل الحفظ',
                            text: response.data.message ?? 'يرجى التحقق من البيانات.',
                            confirmButtonText: 'حاول مرة أخرى'
                        });
                    }

                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'حدث خطأ',
                        text: error.response?.data?.message ?? 'يرجى المحاولة مرة أخرى.',
                        confirmButtonText: 'OK'
                    });
                } finally {
                    state.isSubmitting = false;
                }
            },
        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['GoodsReceives']);
                await SecurityManager.validateToken();

                await methods.populateMainData();
                await mainGrid.create(state.mainData);

                mainModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                await methods.populatePurchaseOrderListLookupData();
                await methods.populateGoodsReceiveStatusListLookupData();
                numberText.create();
                receiveDatePicker.create();
                purchaseOrderListLookup.create();
                goodsReceiveStatusListLookup.create();

                await secondaryGrid.create(state.secondaryData);

                await methods.populateWarehouseListLookupData();

            } catch (e) {
                console.error('page init error:', e);
            } finally {

            }
        });

        Vue.onUnmounted(() => {
            mainModalRef.value?.removeEventListener('hidden.bs.modal', methods.onMainModalHidden);
        });

        const mainGrid = {
            obj: null,
            create: async (dataSource) => {
                mainGrid.obj = new ej.grids.Grid({
                    height: '240px',
                    locale: 'ar',
                    enableRtl: true,
                    dataSource: dataSource,
                    allowFiltering: true,
                    allowSorting: true,
                    allowSelection: true,
                    allowGrouping: true,
                    allowTextWrap: true,
                    allowResizing: true,
                    allowPaging: true,
                    allowExcelExport: true,
                    filterSettings: { type: 'CheckBox' },
                    sortSettings: { columns: [{ field: 'createdAtUtc', direction: 'Descending' }] },
                    pageSettings: { currentPage: 1, pageSize: 50, pageSizes: ["10", "20", "50", "100", "200", "All"] },
                    selectionSettings: { persistSelection: true, type: 'Single' },
                    autoFit: true,
                    showColumnMenu: true,
                    gridLines: 'Horizontal',
                    columns: [
                        { type: 'checkbox', width: 60 },
                        { field: 'id', isPrimaryKey: true, headerText: 'Id', visible: false },
                        { field: 'number', headerText: 'Number', width: 150, minWidth: 150 },
                        { field: 'receiveDate', headerText: 'تاريخ اذن الاضافة', width: 150, format: 'yyyy-MM-dd' },
                        { field: 'purchaseOrderNumber', headerText: 'رقم أمر التوريد', width: 150, minWidth: 150 },
                        { field: 'statusName', headerText: 'الحالة', width: 150, minWidth: 150 },
                        { field: 'createdAtUtc', headerText: 'تاريخ الإنشاء UTC', width: 150, format: 'yyyy-MM-dd HH:mm' }
                    ],
                    toolbar: [
                        { text: 'تصدير إكسل', tooltipText: 'تصدير إلى Excel', prefixIcon: 'e-excelexport', id: 'MainGrid_excelexport' },

                        'Search',
                        { type: 'Separator' },
                        { text: 'إضافة', tooltipText: 'إضافة', prefixIcon: 'e-add', id: 'AddCustom' },
                        { text: 'تعديل', tooltipText: 'تعديل', prefixIcon: 'e-edit', id: 'EditCustom' },
                        { text: 'حذف', tooltipText: 'حذف', prefixIcon: 'e-delete', id: 'DeleteCustom' },
                        { type: 'Separator' },
                        { text: 'طباعة PDF', tooltipText: 'طباعة PDF', id: 'PrintPDFCustom' },
                    ],

                    beforeDataBound: () => { },
                    dataBound: function () {
                        mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'PrintPDFCustom'], false);
                        mainGrid.obj.autoFitColumns(['number', 'receiveDate', 'purchaseOrderNumber', 'statusName', 'createdAtUtc']);
                    },
                    excelExportComplete: () => { },
                    rowSelected: () => {
                        if (mainGrid.obj.getSelectedRecords().length == 1) {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'PrintPDFCustom'], true);
                        } else {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'PrintPDFCustom'], false);
                        }
                    },
                    rowDeselected: () => {
                        if (mainGrid.obj.getSelectedRecords().length == 1) {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'PrintPDFCustom'], true);
                        } else {
                            mainGrid.obj.toolbarModule.enableItems(['EditCustom', 'DeleteCustom', 'PrintPDFCustom'], false);
                        }
                    },
                    rowSelecting: () => {
                        if (mainGrid.obj.getSelectedRecords().length) {
                            mainGrid.obj.clearSelection();
                        }
                    },
                    toolbarClick: async (args) => {
                        if (args.item.id === 'MainGrid_excelexport') {
                            mainGrid.obj.excelExport();
                        }

                        if (args.item.id === 'AddCustom') {
                            state.deleteMode = false;
                            state.mainTitle = 'اضافة اذن اضافة';
                            resetFormState();
                            state.showComplexDiv = false;
                            mainModal.obj.show();
                        }

                        if (args.item.id === 'EditCustom') {
                            state.deleteMode = false;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'تعديل اذن اضافة';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.receiveDate = selectedRecord.receiveDate ? new Date(selectedRecord.receiveDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.purchaseOrderId = selectedRecord.purchaseOrderId ?? '';
                                state.status = String(selectedRecord.status ?? '');
                                await methods.populateSecondaryData(selectedRecord.id);
                                secondaryGrid.refresh();
                                state.showComplexDiv = true;
                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'DeleteCustom') {
                            state.deleteMode = true;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'حذف اذن اضافة?';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.receiveDate = selectedRecord.receiveDate ? new Date(selectedRecord.receiveDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.purchaseOrderId = selectedRecord.purchaseOrderId ?? '';
                                state.status = String(selectedRecord.status ?? '');
                                await methods.populateSecondaryData(selectedRecord.id);
                                secondaryGrid.refresh();
                                state.showComplexDiv = false;
                                mainModal.obj.show();
                            }
                        }

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

        const secondaryGrid = {
            obj: null,
            create: async (dataSource) => {
                secondaryGrid.obj = new ej.grids.Grid({
                    height: 400,
                    locale: 'ar',
                    enableRtl: true,
                    dataSource: dataSource,
                    editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, showDeleteConfirmDialog: true, mode: 'Normal', allowEditOnDblClick: true },
                    allowFiltering: false,
                    allowSorting: true,
                    allowSelection: true,
                    allowGrouping: false,
                    allowTextWrap: true,
                    allowResizing: true,
                    allowPaging: false,
                    allowExcelExport: true,
                    filterSettings: { type: 'CheckBox' },
                    sortSettings: { columns: [{ field: 'warehouseName', direction: 'Descending' }] },
                    pageSettings: { currentPage: 1, pageSize: 50, pageSizes: ["10", "20", "50", "100", "200", "All"] },
                    selectionSettings: { persistSelection: true, type: 'Single' },
                    autoFit: false,
                    showColumnMenu: false,
                    gridLines: 'Horizontal',
                    columns: [
                        { type: 'checkbox', width: 60 },
                        {
                            field: 'id', isPrimaryKey: true, headerText: 'Id', visible: false
                        },
                        {
                            field: 'purchaseOrderItemId',
                            visible: false
                        },

                        {
                            field: 'warehouseId',
                            headerText: 'Warehouse',
                            width: 250,
                            validationRules: { required: true },
                            disableHtmlEncode: false,
                            valueAccessor: (field, data, column) => {
                                const warehouse = state.warehouseListLookupData.find(item => item.id === data[field]);
                                return warehouse ? `${warehouse.name}` : '';
                            },
                            editType: 'dropdownedit',
                            edit: {
                                create: () => {
                                    const warehouseElem = document.createElement('input');
                                    return warehouseElem;
                                },
                                read: () => {
                                    return warehouseObj.value;
                                },
                                destroy: function () {
                                    warehouseObj.destroy();
                                },
                                write: function (args) {
                                    warehouseObj = new ej.dropdowns.DropDownList({
                                        dataSource: state.warehouseListLookupData,
                                        fields: { value: 'id', text: 'name' },
                                        value: args.rowData.warehouseId,
                                        placeholder: 'اختر المخزن',
                                        floatLabelType: 'Never'
                                    });
                                    warehouseObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'productId',
                            headerText: 'Product',
                            width: 250,
                            validationRules: { required: true },
                            disableHtmlEncode: false,
                            valueAccessor: (field, data) => {
                                const product = state.productListLookupData.find(
                                    item => item.id === data.productId
                                );
                                return product ? product.numberName : '';
                            },

                            editType: 'dropdownedit',
                            edit: {
                                create: () => {
                                    const productElem = document.createElement('input');
                                    return productElem;
                                },
                                read: () => {
                                    return productObj.value;
                                },
                                destroy: function () {
                                    productObj.destroy();
                                },
                                write: function (args) {
                                    productObj = new ej.dropdowns.DropDownList({
                                        dataSource: state.productListLookupData,
                                        fields: { value: 'id', text: 'numberName' },
                                        value: args.rowData.productId,
                                        change: function (e) {
                                            const selected = state.productListLookupData.find(
                                                p => p.id === e.value
                                            );

                                            if (selected) {
                                                args.rowData.purchaseOrderItemId = selected.purchaseOrderItemId; // ⭐
                                                args.rowData.unitPrice = selected.unitPrice;                     // ⭐
                                            }

                                            if (movementObj) {
                                                movementObj.value = 1;
                                            }
                                        },
                                        placeholder: 'اختر المنتج',
                                        floatLabelType: 'Never'
                                    });

                                    productObj.appendTo(args.element);
                                }

                            }
                        },
                        {
                            field: 'movement',
                            headerText: 'Movement',
                            width: 200,
                            validationRules: {
                                required: true,
                                custom: [(args) => {
                                    return args['value'] > 0;
                                }, 'الرقم يجب ان يكون موجب']
                            },
                            type: 'number',
                            format: 'N2', textAlign: 'Right',
                            edit: {
                                create: () => {
                                    const movementElem = document.createElement('input');
                                    return movementElem;
                                },
                                read: () => {
                                    return movementObj.value;
                                },
                                destroy: function () {
                                    movementObj.destroy();
                                },
                                write: function (args) {
                                    movementObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.movement ?? 0,
                                    });
                                    movementObj.appendTo(args.element);
                                }
                            }
                        },
                    ],
                    toolbar: [
                        'ExcelExport',
                        { type: 'Separator' },
                        'Edit', 'Delete', 'Update', 'Cancel',
                    ],
                    actionBegin: (args) => {
                        if (args.requestType === 'add') {
                            args.data.purchaseOrderItemId = null;
                            args.data.unitPrice = 0;
                        }

                        if (args.requestType === 'save') {
                            const product = state.productListLookupData.find(
                                p => p.id === args.data.productId
                            );

                            if (product) {
                                args.data.purchaseOrderItemId = product.purchaseOrderItemId;
                                args.data.unitPrice = product.unitPrice;
                            }
                        }
                    },

                    beforeDataBound: () => { },
                    dataBound: function () { },
                    excelExportComplete: () => { },
                    rowSelected: () => {
                        if (secondaryGrid.obj.getSelectedRecords().length == 1) {
                            secondaryGrid.obj.toolbarModule.enableItems(['Edit'], true);
                        } else {
                            secondaryGrid.obj.toolbarModule.enableItems(['Edit'], false);
                        }
                    },
                    rowDeselected: () => {
                        if (secondaryGrid.obj.getSelectedRecords().length == 1) {
                            secondaryGrid.obj.toolbarModule.enableItems(['Edit'], true);
                        } else {
                            secondaryGrid.obj.toolbarModule.enableItems(['Edit'], false);
                        }
                    },
                    rowSelecting: () => {
                        if (secondaryGrid.obj.getSelectedRecords().length) {
                            secondaryGrid.obj.clearSelection();
                        }
                    },
                    toolbarClick: (args) => {
                        if (args.item.id === 'SecondaryGrid_excelexport') {
                            secondaryGrid.obj.excelExport();
                        }
                    },
                    actionComplete: async (args) => {
                        if (args.requestType === 'save' && args.action === 'add') {
                            try {
                                const response = await services.createSecondaryData(state.id, args.data.warehouseId, args.data.productId, args.data.movement, StorageManager.getUserId(), args.data.purchaseOrderItemId);
                                await methods.populateSecondaryData(state.id);
                                secondaryGrid.refresh();
                                if (response.data.code === 200) {
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'تم الحفظ',
                                        timer: 2000,
                                        showConfirmButton: false
                                    });
                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'فشل الحفظ',
                                        text: response.data.message ?? 'يرجى التحقق من البيانات.',
                                        confirmButtonText: 'حاول مرة أخرى'
                                    });
                                }
                            } catch (error) {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'حدث خطأ',
                                    text: error.response?.data?.message ?? 'يرجى المحاولة مرة أخرى.',
                                    confirmButtonText: 'OK'
                                });
                            }
                        }
                        if (args.requestType === 'save' && args.action === 'edit') {
                            try {
                                const response = await services.updateSecondaryData(
                                    args.data.id,
                                    args.data.warehouseId,
                                    args.data.productId,
                                    args.data.movement,
                                    StorageManager.getUserId(),
                                    args.data.purchaseOrderItemId // ⭐ مهم
                                );

                                await methods.populateSecondaryData(state.id);
                                console.log('PO Item ID:', args.data.purchaseOrderItemId);
                                secondaryGrid.refresh();
                                if (response.data.code === 200) {
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'تم التعديل',
                                        timer: 2000,
                                        showConfirmButton: false
                                    });
                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Update Failed',
                                        text: response.data.message ?? 'يرجى التحقق من البيانات.',
                                        confirmButtonText: 'حاول مرة أخرى'
                                    });
                                }
                            } catch (error) {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'حدث خطأ',
                                    text: error.response?.data?.message ?? 'يرجى المحاولة مرة أخرى.',
                                    confirmButtonText: 'OK'
                                });
                            }
                        }
                        if (args.requestType === 'delete') {
                            try {
                                const response = await services.deleteSecondaryData(args.data[0].id, StorageManager.getUserId());
                                await methods.populateSecondaryData(state.id);
                                secondaryGrid.refresh();
                                if (response.data.code === 200) {
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'تم الحذف',
                                        timer: 2000,
                                        showConfirmButton: false
                                    });
                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Delete Failed',
                                        text: response.data.message ?? 'يرجى التحقق من البيانات.',
                                        confirmButtonText: 'حاول مرة أخرى'
                                    });
                                }
                            } catch (error) {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'حدث خطأ',
                                    text: error.response?.data?.message ?? 'يرجى المحاولة مرة أخرى.',
                                    confirmButtonText: 'OK'
                                });
                            }
                        }
                        methods.refreshSummary();
                    }
                });
                secondaryGrid.obj.appendTo(secondaryGridRef.value);

            },
            refresh: () => {
                secondaryGrid.obj.setProperties({ dataSource: state.secondaryData });
            }
        };

        const mainModal = {
            obj: null,
            create: () => {
                mainModal.obj = new bootstrap.Modal(mainModalRef.value, {
                    backdrop: 'static',
                    keyboard: false
                });
            }
        };

        return {
            mainGridRef,
            mainModalRef,
            secondaryGridRef,
            numberRef,
            receiveDateRef,
            purchaseOrderIdRef,
            statusRef,
            state,
            handler,
        };
    }
};

Vue.createApp(App).mount('#app');