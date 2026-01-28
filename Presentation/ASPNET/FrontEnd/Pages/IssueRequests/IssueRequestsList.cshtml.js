ej.base.L10n.load({
    'ar': {
        'grid': {
            'EmptyRecord': 'لا توجد بيانات للعرض',
            'GroupDropArea': 'اسحب عنوان العمود هنا لتجميع البيانات',
            'UnGroup': 'اضغط لإلغاء التجميع',
            'Item': 'عنصر',
            'Items': 'عناصر',
            'Add': 'إضافة',
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
        },
        'ar': {
            'grid': {
                'ExcelExport': 'تصدير إكسل',
            }
        }
    }
});
const App = {
    setup() {
        
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            employeeListLookupData: [],
            departmentListLookupData: [],
           
            IssueRequestsStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            warehouseListLookupData: [],

            mainTitle: null,
            id: '',
            number: '',
            orderDate: '',
            description: '',
            employeeId: null,
            warehouseId:null,
            departmentId: null,
            orderStatus: null,
            errors: {
                orderDate: '',
                employeeId: '',
                warehouseId:'',
                orderStatus: '',
                description: ''
            },
            showComplexDiv: false,
            isSubmitting: false,
            subTotalAmount: '0.00',
            taxAmount: '0.00',
            totalAmount: '0.00'
        });

        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const orderDateRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const employeeIdRef = Vue.ref(null);
        const departmentIdRef = Vue.ref(null);
        const warehouseIdRef = Vue.ref(null);


        const orderStatusRef = Vue.ref(null);
        const secondaryGridRef = Vue.ref(null);

        const validateForm = function () {
            state.errors.orderDate = '';
            state.errors.employeeId = '';
            state.errors.orderStatus = '';

            let isValid = true;

            if (state.orderDate == null || state.orderDate === '') {
                state.errors.orderDate = 'Order date is required.';
                isValid = false;
            }
            if (state.employeeId == null || state.employeeId === '') {
                state.errors.employeeId = 'employee is required.';
                isValid = false;
            }

            if (state.orderStatus == null || state.orderStatus === '') {
                state.errors.orderStatus = 'Order status is required.';
                isValid = false;
            }

            return isValid;
        };

        const resetFormState = () => {
            state.id = '';
            state.number = '';
            state.orderDate = '';
            state.description = '';
    
            state.orderStatus = null;
            state.errors = {
                orderDate: '',
                employeeId: '',
                departmentId: '',
                warehouseId:'',
                orderStatus: '',
                description: ''
            };
            state.secondaryData = [];
            state.subTotalAmount = '0.00';
      
            state.totalAmount = '0.00';
            state.showComplexDiv = false;
        };

        const services = {
            getMainData: async () => {
                try {
                    const response = await AxiosManager.get('/IssueRequests/GetIssueRequestsList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            // Replace services.createMainData with this implementation
            createMainData: async (orderDate, description, orderStatus, departmentId, employeeId, warehouseId, createdById) => {
                try {
                    const payload = {
                        orderDate: orderDate ? new Date(orderDate).toISOString() : null,
                        description: description ?? '',
                        // backend expects string for OrderStatus -> send as string to avoid type coercion issues
                        orderStatus: String(orderStatus ?? ''),
                        departmentId: departmentId ?? null,
                        employeeId: employeeId ?? null,
                        warehouseId: warehouseId ?? null,
                        createdById: createdById ?? null
                    };

                    console.debug('CreateIssueRequests payload (client):', payload);

                    // Ensure we send raw JSON and explicit content-type
                    const response = await AxiosManager.post('/IssueRequests/CreateIssueRequests', JSON.stringify(payload), {
                        headers: { 'Content-Type': 'application/json' }
                    });

                    console.debug('CreateIssueRequests response:', response?.data);
                    return response;
                } catch (error) {
                    console.error('CreateIssueRequests error:', error?.response?.data ?? error);
                    throw error;
                }
            },
            
            updateMainData: async (id, orderDate, description, orderStatus, departmentId, employeeId, warehouseId, updatedById) => {
                try {
                    const response = await AxiosManager.post('/IssueRequests/UpdateIssueRequests', {
                        id, orderDate, description, orderStatus, departmentId, employeeId, warehouseId,updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteMainData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/IssueRequests/DeleteIssueRequests', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getDepartmentListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Department/GetDepartmentList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getemployeeListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/employee/GetemployeeList', { params: { departmentId: state.departmentId } });
                    return response;
                } catch (error) {
                    throw error;
                }
            },

          
            getIssueRequestsStatusListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/IssueRequests/GetIssueRequestsStatusList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getSecondaryData: async (IssueRequestsId) => {
                try {
                    const response = await AxiosManager.get('/IssueRequestsItem/GetIssueRequestsItemByIssueRequestsIdList?IssueRequestsId=' + IssueRequestsId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createSecondaryData: async (unitPrice, requestedQuantity, suppliedQuantity, summary, productId, warehouseId, IssueRequestsId, createdById) => {
                try {
                    const response = await AxiosManager.post('/IssueRequestsItem/CreateIssueRequestsItem', {
                        unitPrice, requestedQuantity, suppliedQuantity, summary, productId, warehouseId , IssueRequestsId, createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },                               
            updateSecondaryData: async (id, unitPrice, requestedQuantity, suppliedQuantity, summary, productId, warehouseId , IssueRequestsId, updatedById) => {
                try {
                    const response = await AxiosManager.post('/IssueRequestsItem/UpdateIssueRequestsItem', {
                        id, unitPrice, requestedQuantity, suppliedQuantity, summary, productId,  warehouseId, IssueRequestsId, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteSecondaryData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/IssueRequestsItem/DeleteIssueRequestsItem', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getWarehouseListLookupData: async () => {
                const response = await AxiosManager.get('/Warehouse/GetWarehouseList', {});
                return response;
            },

            getProductListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/Product/GetProductList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            }
        };

        const methods = {

            populateDepartmentListLookupData: async () => {
                const response = await services.getDepartmentListLookupData();
                state.departmentListLookupData = response?.data?.content?.data;
            },
            
            populateemployeeListLookupData: async () => {
                const response = await services.getemployeeListLookupData();
                state.employeeListLookupData = response?.data?.content?.data;
            },
            populateIssueRequestsStatusListLookupData: async () => {
                const response = await services.getIssueRequestsStatusListLookupData();
                const data = response?.data?.content?.data ?? [];
                state.issueRequestsStatusListLookupData = data.map(item => ({
                    id: Number(item.id), 
                    name: item.name === 'Draft' ? 'مسودة' :
                           item.name === 'Confirmed' ? 'مؤكد' :
                           item.name === 'Cancelled' ? 'ملغي' :
                           item.name === 'Archived' ? 'مؤرشف' :
                           item.name
                }));
            },
        
            populateMainData: async () => {
                const response = await services.getMainData();
                state.mainData = response?.data?.content?.data.map(item => ({
                    ...item,
                    orderDate: new Date(item.orderDate),
                    createdAtUtc: new Date(item.createdAtUtc)
                }));
            },
            populateSecondaryData: async (IssueRequestsId) => {
                try {
                    const response = await services.getSecondaryData(IssueRequestsId);
                    state.secondaryData = response?.data?.content?.data.map(item => ({
                        ...item,
                        createdAtUtc: new Date(item.createdAtUtc)
                    }));
                    methods.refreshPaymentSummary(IssueRequestsId);
                } catch (error) {
                    state.secondaryData = [];
                }
            },
            populateWarehouseListLookupData: async () => {
                const response = await services.getWarehouseListLookupData();
                state.warehouseListLookupData = response?.data?.content?.data;
            },

            populateProductListLookupData: async () => {
                const response = await services.getProductListLookupData();
                state.productListLookupData = response?.data?.content?.data;
            },
            refreshPaymentSummary: async (id) => {
                const record = state.mainData.find(item => item.id === id);
                if (record) {
                    state.subTotalAmount = NumberFormatManager.formatToLocale(record.beforeTaxAmount ?? 0);
                    state.taxAmount = NumberFormatManager.formatToLocale(record.taxAmount ?? 0);
                    state.totalAmount = NumberFormatManager.formatToLocale(record.afterTaxAmount ?? 0);
                }
            },
            handleFormSubmit: async () => {
                state.isSubmitting = true;
                await new Promise(resolve => setTimeout(resolve, 200));

                if (!validateForm()) {
                    state.isSubmitting = false;
                    return;
                }
                state.orderStatus = Number(state.orderStatus ?? 0);
                console.log(state);
                try {
                    const response = state.id === ''
                        ? await services.createMainData(state.orderDate, state.description, state.orderStatus, state.departmentId, state.employeeId, state.warehouseId, StorageManager.getUserId())
                        : state.deleteMode
                            ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(state.id, state.orderDate, state.description, state.orderStatus, state.departmentId, state.employeeId, state.warehouseId, StorageManager.getUserId());

                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            state.mainTitle = 'Edit Sales Order';
                            state.id = response?.data?.content?.data.id ?? '';
                            state.number = response?.data?.content?.data.number ?? '';
                            state.orderDate = response?.data?.content?.data.orderDate ? new Date(response.data.content.data.orderDate) : null;
                            state.description = response?.data?.content?.data.description ?? '';
                            state.employeeId = response?.data?.content?.data.employeeId ?? '';
                            state.departmentId = response?.data?.content?.data.departmentId ?? '';
                            state.warehouseId = response?.data?.content?.data.warehouseId ?? '';
                            state.orderStatus = Number(response?.data?.content?.data.orderStatus ?? 0);
                           // state.orderStatus = String(response?.data?.content?.data.orderStatus ?? '');
                            state.showComplexDiv = true;

                            await methods.refreshPaymentSummary(state.id);

                            Swal.fire({
                                icon: 'success',
                                title: 'تم الحفظ',
                                timer: 1000,
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
            onMainModalHidden: () => {
                state.errors.orderDate = '';
                state.errors.employeeId = '';
                state.errors.warehouseId = '';
                state.errors.orderStatus = '';
          
            }
        };

        const departmentListLookup = {
            obj: null,
            create: () => {
                departmentListLookup.obj = new ej.dropdowns.DropDownList({
                    dataSource: state.departmentListLookupData,
                    fields: { value: 'id', text: 'name' },
                    placeholder: 'اختر القسم',

                    change: async (e) => {
                        state.departmentId = e.value;
                        state.employeeId = null;

                        await syncDepartmentAndEmployee(e.value, null);
                    }
                });

                departmentListLookup.obj.appendTo(departmentIdRef.value);
            }
        };

        const employeeListLookup = {
            obj: null,
            create: () => {
                employeeListLookup.obj = new ej.dropdowns.DropDownList({
                    dataSource: state.employeeListLookupData, // assign full list
                    fields: { value: 'id', text: 'name' },
                    placeholder: 'اختر الموظف',
                    allowFiltering: true,
                    filtering: (e) => {
                        e.preventDefaultAction = true;
                        let query = new ej.data.Query();
                        if (e.text) {
                            query = query.where('name', 'contains', e.text, true);
                        }
                        e.updateData(employeeListLookup.obj.dataSource, query);
                    },
                    change: (e) => {
                        state.employeeId = e.value;
                        state.errors.employeeId = '';
                    }
                });

                employeeListLookup.obj.appendTo(employeeIdRef.value);
            }
        };

        const warehouseListLookup = {
            obj: null,
            create: () => {
                warehouseListLookup.obj = new ej.dropdowns.DropDownList({
                    dataSource: state.warehouseListLookupData, // assign full list
                    fields: { value: 'id', text: 'name' },
                    placeholder: 'اختر المخززن',
                    
                    change: (e) => {
                        state.warehouseId = e.value;
                        state.errors.warehouseId = '';
                    }
                });

                warehouseListLookup.obj.appendTo(warehouseIdRef.value);
            }
        };

        const IssueRequestsStatusListLookup = {
            obj: null,
            create: () => {
                IssueRequestsStatusListLookup.obj = new ej.dropdowns.DropDownList({
                    dataSource: state.issueRequestsStatusListLookupData,
                    fields: { value: 'id', text: 'name' },
                    placeholder: 'اختر الحالة',
                    value: state.orderStatus ?? null, 
                    change: (e) => {
                        state.orderStatus = Number(e.value); 
                        state.errors.orderStatus = '';

                        // Disable secondary grid if "مؤكد"
                        const selectedName = e.itemData?.name ?? '';
                        if (selectedName === 'مؤكد') {
                            secondaryGrid.obj.editSettings.allowEditing = false;
                            secondaryGrid.obj.editSettings.allowAdding = false;
                            secondaryGrid.obj.editSettings.allowDeleting = false;
                        } else {
                            secondaryGrid.obj.editSettings.allowEditing = true;
                            secondaryGrid.obj.editSettings.allowAdding = true;
                            secondaryGrid.obj.editSettings.allowDeleting = true;
                        }
                        secondaryGrid.obj.refresh();
                    }
                });

                IssueRequestsStatusListLookup.obj.appendTo(orderStatusRef.value);
            },
            refresh: () => {
                if (IssueRequestsStatusListLookup.obj) {
                    IssueRequestsStatusListLookup.obj.value = Number(state.orderStatus ?? 0); 
                }
            }
        };

        const orderDatePicker = {
            obj: null,
            create: () => {
                orderDatePicker.obj = new ej.calendars.DatePicker({
                    format: 'yyyy-MM-dd',
                    value: state.orderDate ? new Date(state.orderDate) : null,
                    change: (e) => {
                        state.orderDate = e.value;
                    }
                });
                orderDatePicker.obj.appendTo(orderDateRef.value);
            },
            refresh: () => {
                if (orderDatePicker.obj) {
                    orderDatePicker.obj.value = state.orderDate ? new Date(state.orderDate) : null;
                }
            }
        };

        const numberText = {
            obj: null,
            create: () => {
                numberText.obj = new ej.inputs.TextBox({
                    placeholder: '[auto]',
                    readonly: true
                });
                numberText.obj.appendTo(numberRef.value);
            }
        };

        Vue.watch(
            () => state.orderDate,
            (newVal, oldVal) => {
                orderDatePicker.refresh();
                state.errors.orderDate = '';
            }
        );

        Vue.watch(
            () => state.orderStatus,
            (newVal, oldVal) => {
                IssueRequestsStatusListLookup.refresh();
                state.errors.orderStatus = '';
            }
        );

        async function syncDepartmentAndEmployee(departmentId, employeeId) {
            while (!state.employeeListLookupData || state.employeeListLookupData.length === 0) {
                await new Promise(r => setTimeout(r, 50));
            }

            const filtered = state.employeeListLookupData
                .filter(e => e.departmentId === departmentId)
                .map(e => ({
                    ...e,
                    id: String(e.id) 
                }));

            employeeListLookup.obj.value = null; 
            employeeListLookup.obj.dataSource = filtered;
            employeeListLookup.obj.dataBind();

            setTimeout(() => {
                employeeListLookup.obj.value = employeeId != null ? String(employeeId) : null;
            }, 50);
        }

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
                    groupSettings: { columns: ['employeeName'] },
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
                        { field: 'id', isPrimaryKey: true, headerText: 'معرف', visible: false },
                        { field: 'number', headerText: 'رقم الطلب', width: 150, minWidth: 150 },
                        { field: 'orderDate', headerText: 'تاريخ الطلب', width: 150, format: 'yyyy-MM-dd' },
                        { field: 'employeeName', headerText: 'العميل', width: 200, minWidth: 200 },
                        { field: 'departmentName', headerText: 'الادارة', width: 200, minWidth: 200 },
                        { field: 'orderStatusName', headerText: 'الحالة', width: 150, minWidth: 150 },
                       
                        { field: 'afterTaxAmount', headerText: 'الإجمالي', width: 150, minWidth: 150, format: 'N2' },
                        { field: 'createdAtUtc', headerText: 'تاريخ الإنشاء (UTC)', width: 150, format: 'yyyy-MM-dd HH:mm' }
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
                        mainGrid.obj.autoFitColumns(['number', 'orderDate', 'employeeName', 'orderStatusName',  'afterTaxAmount', 'createdAtUtc']);
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
                            state.mainTitle = 'إضافة طلب وإذن صرف';
                            resetFormState();
                            state.secondaryData = [];
                            secondaryGrid.refresh();
                            state.showComplexDiv = false;
                            mainModal.obj.show();
                        }

                 

                        if (args.item.id === 'EditCustom') {
                            state.deleteMode = false; if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                console.log(selectedRecord);
                                state.mainTitle = 'تعديل طلب وإذن الصرف';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.orderDate = selectedRecord.orderDate ? new Date(selectedRecord.orderDate) : null;
                                state.description = selectedRecord.description ?? '';
                                //state.employeeId = selectedRecord.employeeId ?? '';
                                state.employeeId = selectedRecord.employeeId
                                    ? String(selectedRecord.employeeId)
                                    : null;

                               // state.orderStatus = selectedRecord.orderStatus;
                                state.orderStatus = Number(selectedRecord.orderStatus ?? 0); // numeric!
                                IssueRequestsStatusListLookup.refresh(); // sync dropdown
                                // state.orderStatus = String(selectedRecord.orderStatus ?? '');
                                state.departmentId = selectedRecord.departmentId ?? null;
                                state.warehouseId = selectedRecord.warehouseId ?? null;
                                state.showComplexDiv = true;
                                secondaryGrid.isRowEditing = false;
                                if (secondaryGrid.obj) {
                                    secondaryGrid.obj.hideColumns(['availableQuantity']);
                                }
                                departmentListLookup.obj.value = state.departmentId;
                                
                                console.log(state);

                                await syncDepartmentAndEmployee(state.departmentId, state.employeeId);
                                await methods.populateSecondaryData(selectedRecord.id);
                                if (warehouseListLookup.obj) {
                                    warehouseListLookup.obj.value = state.warehouseId != null ? String(state.warehouseId) : null;
                                    warehouseListLookup.obj.dataBind();
                                }
                                // debug: verify selected record and lookup types
                                console.log('selectedRecord:', selectedRecord);
                                console.log('state.warehouseId:', state.warehouseId);
                                console.log('warehouseListLookupData sample:', state.warehouseListLookupData?.[0]);

                                employeeListLookup.obj.value = state.employeeId;
                                secondaryGrid.refresh();
                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'DeleteCustom') {
                            state.deleteMode = true;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'حذف طلب المبيعات؟';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.orderDate = selectedRecord.orderDate ? new Date(selectedRecord.orderDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.employeeId = selectedRecord.employeeId ?? '';
                                state.departmentId = selectedRecord.departmentId ?? '';
                  
                                //state.orderStatus = String(selectedRecord.orderStatus ?? '');
                                state.orderStatus = Number(selectedRecord.orderStatus ?? 0);
                                state.showComplexDiv = false;

                                await methods.populateSecondaryData(selectedRecord.id);
                                secondaryGrid.refresh();

                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'PrintPDFCustom') {
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                window.open('/IssueRequestss/IssueRequestsPdf?id=' + (selectedRecord.id ?? ''), '_blank');
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

        let warehouseObj = null;
        let productObj = null;
        let availableQuantityObj = null;

        let requestedQuantityObj = null;
        let suppliedQuantityObj = null;
        let unitPriceObj = null;

        async function updateAvailableQuantity(rowData) {
            console.log(state.warehouseId);
            if (!rowData.productId || !state.warehouseId) {
                rowData.availableQuantity = 0;
                if (availableQuantityObj) availableQuantityObj.value = 0;
                return;
            }

            try {
                const res = await AxiosManager.get(
                    `/IssueRequests/GetProductCurrentStock?productId=${rowData.productId}&warehouseId=${state.warehouseId}`
                );

                let stock = res.data?.content?.data?.currentStock ?? 0;

                const suppliedInRequest = state.secondaryData
                    .filter(item =>
                        item.productId === rowData.productId &&
                        item.id !== rowData.id
                    )
                    .reduce((sum, item) => sum + (item.suppliedQuantity ?? 0), 0);

                stock -= suppliedInRequest;

                rowData.availableQuantity = stock;

                if (availableQuantityObj)
                    availableQuantityObj.value = stock;

            } catch (error) {
                console.error('Error loading stock:', error);
                rowData.availableQuantity = 0;
                if (availableQuantityObj) availableQuantityObj.value = 0;
            }
        }

        function getAvailableProducts(currentRow) {
            return state.productListLookupData.filter(p => {
                return !state.secondaryData.some(item =>
                    item.productId === p.id &&
                    item.id !== currentRow.id
                );
            });
        }

        const secondaryGrid = {
            obj: null,
            create: async (dataSource) => {
                secondaryGrid.obj = new ej.grids.Grid({
                    locale: 'ar',
                    height: 400,
                    dataSource: dataSource,
                    editSettings: {
                        allowEditing: true,
                        allowAdding: true,
                        allowDeleting: true,
                        showDeleteConfirmDialog: true,
                        mode: 'Normal',
                        allowEditOnDblClick: true
                    },
                    allowFiltering: false,
                    allowSorting: true,
                    allowSelection: true,
                    allowGrouping: false,
                    allowTextWrap: true,
                    allowResizing: true,
                    allowPaging: false,
                    allowExcelExport: true,
                    filterSettings: { type: 'CheckBox' },
                    sortSettings: { columns: [{ field: 'productName', direction: 'Descending' }] },
                    selectionSettings: { persistSelection: true, type: 'Single' },
                    gridLines: 'Horizontal',
                    columns: [
                        { type: 'checkbox', width: 60 },
                        { field: 'id', isPrimaryKey: true, headerText: 'معرف', visible: false },

                        {
                            field: 'productId',
                            headerText: 'المنتج',
                            width: 250,
                            validationRules: { required: true },
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => productObj?.value ?? null,
                                write: (args) => {
                                    const filteredProducts = getAvailableProducts(args.rowData);

                                    productObj = new ej.dropdowns.DropDownList({
                                        dataSource: filteredProducts,
                                        fields: { text: 'name', value: 'id' },
                                        value: args.rowData.productId ?? null,
                                        allowFiltering: true,
                                        placeholder: 'اختر المنتج',
                                        change: async (e) => {
                                            args.rowData.productId = e.value;

                                            const product = state.productListLookupData.find(x => x.id === e.value);
                                            if (!product) return;

                                            if (priceObj) priceObj.value = product.unitPrice ?? 0;
                                            if (summaryObj) summaryObj.value = product.description;
                                            if (numberObj) numberObj.value = product.number;

                                            await updateAvailableQuantity(args.rowData);
                                        }
                                    });

                                    productObj.appendTo(args.element);
                                }
                            },
                            valueAccessor: (field, data) => {
                                const p = state.productListLookupData.find(x => x.id === data[field]);
                                return p ? p.name : '';
                            }
                        },

                        {
                            field: 'unitPrice',
                            headerText: 'سعر الوحدة',
                            width: 200,
                            validationRules: { required: true },
                            type: 'number',
                            format: 'N2',
                            textAlign: 'Right',
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => priceObj.value,
                                destroy: () => priceObj.destroy(),
                                write: (args) => {
                                    priceObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.unitPrice ?? 0,
                                        change: () => updateAvailableQuantity(args.rowData)
                                    });
                                    priceObj.appendTo(args.element);
                                }
                            }
                        },

                        {
                            field: 'availableQuantity',
                            headerText: 'المتاح بالمخزن',
                            width: 200,
                            type: 'number',
                            format: 'N2',
                            textAlign: 'Right',
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => availableQuantityObj.value,
                                destroy: () => availableQuantityObj.destroy(),
                                write: (args) => {
                                    availableQuantityObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.availableQuantity ?? 0,
                                        readonly: true,
                                        enabled: false
                                    });
                                    availableQuantityObj.appendTo(args.element);
                                }
                            }
                        },

                        {
                            field: 'requestedQuantity',
                            headerText: 'الكمية المطلوبة',
                            width: 180,
                            validationRules: {
                                required: true,
                                custom: [
                                    (args) => args.value > 0,
                                    'يجب أن تكون الكمية المطلوبة أكبر من صفر'
                                ]
                            },
                            edit: {
                                create: () => document.createElement('input'),
                                write: (args) => {
                                    requestedQtyObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.requestedQuantity ?? 0,
                                        min: 1,
                                        change: (e) => {
                                            args.rowData.requestedQuantity = e.value;
                                        }
                                    });
                                    requestedQtyObj.appendTo(args.element);
                                }
                            }
                        },

                        {
                            field: 'suppliedQuantity',
                            headerText: 'الكمية المصروفة',
                            width: 180,
                            edit: {
                                create: () => document.createElement('input'),
                                write: (args) => {
                                    suppliedQtyObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.suppliedQuantity ?? 0,
                                        min: 0,
                                        change: (e) => {
                                            args.rowData.suppliedQuantity = e.value;

                                            args.rowData.total =
                                                (args.rowData.suppliedQuantity ?? 0) *
                                                (args.rowData.unitPrice ?? 0);

                                            if (totalObj) {
                                                totalObj.value = args.rowData.total;
                                            }
                                        }
                                    });
                                    suppliedQtyObj.appendTo(args.element);
                                }
                            }
                        },

                        {
                            field: 'total',
                            headerText: 'الإجمالي',
                            width: 200,
                            type: 'number',
                            format: 'N2',
                            textAlign: 'Right',
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => totalObj?.value ?? null,
                                destroy: () => totalObj?.destroy(),
                                write: (args) => {
                                    totalObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.total ?? null,
                                        readonly: true,
                                        format: 'N2'
                                    });
                                    totalObj.appendTo(args.element);
                                }
                            }
                        },

                        {
                            field: 'productNumber',
                            headerText: 'رقم المنتج',
                            allowEditing: false,
                            width: 180,
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => numberObj.value,
                                destroy: () => numberObj.destroy(),
                                write: (args) => {
                                    numberObj = new ej.inputs.TextBox();
                                    numberObj.value = args.rowData.productNumber;
                                    numberObj.readonly = true;
                                    numberObj.appendTo(args.element);
                                }
                            }
                        },

                        {
                            field: 'summary',
                            headerText: 'وصف المنتج',
                            width: 200,
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => summaryObj.value,
                                destroy: () => summaryObj.destroy(),
                                write: (args) => {
                                    summaryObj = new ej.inputs.TextBox();
                                    summaryObj.value = args.rowData.summary;
                                    summaryObj.appendTo(args.element);
                                }
                            }
                        }
                    ],

                    toolbar: ['ExcelExport', { type: 'Separator' }, 'Add', 'Edit', 'Delete', 'Update', 'Cancel'],

                    actionBegin: async (args) => {

                        if ((args.requestType === 'add' || args.requestType === 'beginEdit') && !state.warehouseId) {
                            args.cancel = true;
                            Swal.fire({
                                icon: 'warning',
                                title: 'تنبيه',
                                text: 'يجب اختيار المخزن أولاً'
                            });
                            return;
                        }

                        if (args.requestType === 'beginEdit' || args.requestType === 'add') {
                            await updateAvailableQuantity(args.rowData);
                        }

                        if (args.requestType === 'save') {
                            const supplied = Number(args.data.suppliedQuantity ?? 0);
                            const available = Number(args.data.availableQuantity ?? 0);
                            const unitPrice = Number(args.data.unitPrice ?? 0);

                            if (supplied > available) {
                                args.cancel = true;
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'تنبيه',
                                    text: 'الكمية المصروفة لا يمكن أن تكون أكبر من الكمية المتاحة بالمخزن'
                                });
                            }

                            args.data.total = supplied * unitPrice;
                        }
                    },

                    actionComplete: async (args) => {

                        if ((args.requestType === 'save') && (args.action === 'add' || args.action === 'edit')) {

                            const IssueRequestsId = state.id;
                            const userId = StorageManager.getUserId();
                            const data = args.data;

                            if (args.action === 'add') {
                                await services.createSecondaryData(
                                    data.unitPrice,
                                    data.requestedQuantity,
                                    data.suppliedQuantity,
                                    data.summary,
                                    data.productId,
                                    state.warehouseId,
                                    IssueRequestsId,
                                    userId
                                );
                            } else {
                                await services.updateSecondaryData(
                                    data.id,
                                    data.unitPrice,
                                    data.requestedQuantity,
                                    data.suppliedQuantity,
                                    data.summary,
                                    data.productId,
                                    state.warehouseId,
                                    IssueRequestsId,
                                    userId
                                );
                            }

                            await methods.populateSecondaryData(IssueRequestsId);
                            secondaryGrid.refresh();

                            Swal.fire({
                                icon: 'success',
                                title: 'تم الحفظ',
                                timer: 2000,
                                showConfirmButton: false
                            });
                        }

                        if (args.requestType === 'delete') {

                            const deletedById = StorageManager.getUserId();
                            const IssueRequestsId = state.id;
                            const deletedRow = args.data[0];

                            if (!deletedRow?.id) return;

                            await services.deleteSecondaryData(deletedRow.id, deletedById);

                            await methods.populateSecondaryData(IssueRequestsId);
                            secondaryGrid.refresh();

                            Swal.fire({
                                icon: 'success',
                                title: 'تم الحذف',
                                timer: 2000,
                                showConfirmButton: false
                            });
                        }
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

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['IssueRequests']);
                await SecurityManager.validateToken();

                await methods.populateMainData();
                await mainGrid.create(state.mainData);

                mainModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);

                
                await methods.populateDepartmentListLookupData();
                departmentListLookup.create(); 

                await methods.populateemployeeListLookupData();
                employeeListLookup.create();
              
          
                await methods.populateIssueRequestsStatusListLookupData();
                IssueRequestsStatusListLookup.create();
                orderDatePicker.create();
                numberText.create();
                await methods.populateWarehouseListLookupData();
                warehouseListLookup.create();

                await methods.populateProductListLookupData();
                await secondaryGrid.create(state.secondaryData);
            } catch (e) {
                console.error('page init error:', e);
            } finally {

            }
        });

        Vue.onUnmounted(() => {
            mainModalRef.value?.removeEventListener('hidden.bs.modal', methods.onMainModalHidden);
        });

        return {
            mainGridRef,
            mainModalRef,
            orderDateRef,
            numberRef,
            employeeIdRef,
            warehouseIdRef,
            departmentIdRef,
            orderStatusRef,
            secondaryGridRef,
            state,
            methods,
            handler: {
                handleSubmit: methods.handleFormSubmit
            }
        };
    }
};

Vue.createApp(App).mount('#app');