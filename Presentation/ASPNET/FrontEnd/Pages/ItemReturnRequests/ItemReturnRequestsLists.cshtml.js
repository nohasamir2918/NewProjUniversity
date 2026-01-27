
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
            'AddemployeeCategory': 'إضافة فئة موردين',
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
            employeeListLookupData: [],
            productListLookupData: [],
            ItemReturnRequestsStatusListLookupData: [],

            mainTitle: null,
            id: '',
            number: '',
            orderDate: '',
            committeeDecision: '',
            quantity: '',
            unitPrice: '',
            employeeId: null,
            productId: null,
            productStatus: null,
            orderStatus: null,
            errors: {
                orderDate: '',
                employeeId: '',
                productId: '',
                productStatus: '',
                orderStatus: '',
                committeeDecision: '',
                quantity: '',
                unitPrice: ''
            },
            showComplexDiv: false,
            isSubmitting: false,
            subTotalAmount: '0.00',

            totalAmount: '0.00'
        });

        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const orderDateRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const employeeIdRef = Vue.ref(null);
        const productIdRef = Vue.ref(null);
        const productStatusRef = Vue.ref(null);
        const orderStatusRef = Vue.ref(null);



        const validateForm = function () {
            state.errors.orderDate = '';
            state.errors.employeeId = '';
            state.errors.productId = '';
            state.errors.orderStatus = '';

            let isValid = true;

            if (!state.orderDate) {
                state.errors.orderDate = 'تاريخ الطلب مطلوب.';
                isValid = false;
            }
            if (!state.employeeId) {
                state.errors.employeeId = 'الموظف مطلوب.';
                isValid = false;
            }
            if (!state.productId) {
                state.errors.productId = 'المنتج مطلوبة.';
                isValid = false;
            }
            if (!state.productStatus) {
                state.errors.productStatus = 'حالة المنتج مطلوبة';
                isValid = false;
            }
            if (!state.orderStatus) {
                state.errors.orderStatus = 'حالة الطلب مطلوبة.';
                isValid = false;
            }
            if (!state.quantity || state.quantity <= 0) {
                state.errors.quantity = 'الكمية مطلوبة';
                isValid = false;
            }

            if (!state.unitPrice || state.unitPrice <= 0) {
                state.errors.unitPrice = 'السعر مطلوب';
                isValid = false;
            }
            return isValid;
        };

        const resetFormState = () => {
            state.id = '';
            state.number = '';
            state.orderDate = '';
            state.committeeDecision = '';
            state.unitPrice = '';
            state.quantity = '';
            state.employeeId = null;
            state.productId = null;
            state.productStatus = null;
            state.orderStatus = null;
            state.errors = {
                orderDate: '',
                employeeId: '',
                productId: '',
                productStatus: '',
                orderStatus: '',
                committeeDecision: ''
            };

        };

        const services = {
            getMainData: async () => {
                try {
                    const response = await AxiosManager.get('/ItemReturnRequests/GetItemReturnRequestsList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createMainData: async (orderDate, committeeDecision, orderStatus, productId, productStatus, employeeId, unitPrice, quantity, createdById) => {
                try {
                    const response = await AxiosManager.post('/ItemReturnRequests/CreateItemReturnRequests', {
                        orderDate, committeeDecision, orderStatus, productId, productStatus, employeeId, unitPrice, quantity, createdById
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateMainData: async (id, orderDate, committeeDecision, orderStatus, productId, productStatus, employeeId, unitPrice, quantity, updatedById) => {
                try {
                    const response = await AxiosManager.post('/ItemReturnRequests/UpdateItemReturnRequests', {
                        id, orderDate, committeeDecision, orderStatus, productId, productStatus, employeeId, unitPrice, quantity, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteMainData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/ItemReturnRequests/DeleteItemReturnRequests', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getemployeeListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/employee/GetemployeeList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getproductListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/product/GetproductList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getItemReturnRequestsStatusListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/ItemReturnRequests/GetItemReturnRequestsStatusList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getProductsByEmployee: async (employeeId) => {
                try {

                    const response = await AxiosManager.get('/ItemReturnRequests/GetProductsByEmployee?employeeId=' + employeeId, {});

                    return response;
                } catch (error) {
                    throw error;
                }
            }


        };

        const methods = {
            populateemployeeListLookupData: async () => {
                const response = await services.getemployeeListLookupData();
                state.employeeListLookupData = response?.data?.content?.data;
            },

            populateproductListLookupData: async () => {
                const response = await services.getproductListLookupData();
                state.productListLookupData = response?.data?.content?.data;
            },
            populateProductsByEmployee: async (employeeId) => {
                if (!employeeId) {
                    state.productListLookupData = [];

                    if (productListLookup.obj) {
                        productListLookup.obj.destroy();
                    }
                    productListLookup.create();
                    return;
                }

                const response = await services.getProductsByEmployee(employeeId);

                state.productListLookupData = response.data.content.products ?? [];
                console.log('Filtered products:', state.productListLookupData);

                if (productListLookup.obj) {
                    productListLookup.obj.destroy();
                }

                productListLookup.create();
            },

            populateItemReturnRequestsStatusListLookupData: async () => {
                const response = await services.getItemReturnRequestsStatusListLookupData();
                state.ItemReturnRequestsStatusListLookupData = response?.data?.content?.data;
            },

            populateMainData: async () => {
                const response = await services.getMainData();
                state.mainData = response?.data?.content?.data.map(item => ({
                    ...item,
                    orderDate: new Date(item.orderDate),
                    createdAtUtc: new Date(item.createdAtUtc)
                }));
            },


            refreshPaymentSummary: async (id) => {
                const record = state.mainData.find(item => item.id === id);
                if (record) {
                    state.subTotalAmount = NumberFormatManager.formatToLocale(record.beforeproductAmount ?? 0);

                    state.totalAmount = NumberFormatManager.formatToLocale(record.afterproductAmount ?? 0);
                }
            },
            handleFormSubmit: async () => {
                state.isSubmitting = true;
                await new Promise(resolve => setTimeout(resolve, 200));

                if (!validateForm()) {
                    state.isSubmitting = false;
                    return;
                }

                try {
                    const response = state.id === ''

                        ? await services.createMainData(state.orderDate, state.committeeDecision, state.orderStatus, state.productId, state.productStatus, state.employeeId, state.unitPrice, state.quantity, StorageManager.getUserId())
                        : state.deleteMode
                            ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(state.id, state.orderDate, state.committeeDecision, state.orderStatus, state.productId, state.productStatus, state.employeeId, state.unitPrice, state.quantity, StorageManager.getUserId());

                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            state.mainTitle = 'تعديل طلب المرتجع';
                            state.id = response?.data?.content?.data.id ?? '';
                            state.number = response?.data?.content?.data.number ?? '';
                            state.orderDate = response?.data?.content?.data.orderDate ? new Date(response.data.content.data.orderDate) : null;
                            state.committeeDecision = response?.data?.content?.data.committeeDecision ?? '';
                            state.employeeId = response?.data?.content?.data.employeeId ?? '';
                            state.productId = response?.data?.content?.data.productId ?? '';
                            state.unitPrice = response?.data?.content?.data.unitPrice ?? '';
                            state.quantity = response?.data?.content?.data.quantity ?? '';
                            productListLookup.trackingChange = true;
                            state.orderStatus = String(response?.data?.content?.data.orderStatus ?? '');
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
                state.errors.productId = '';
                state.errors.orderStatus = '';
                productListLookup.trackingChange = false;
            }
        };

        const employeeListLookup = {
            obj: null,
            create: () => {
                if (state.employeeListLookupData && Array.isArray(state.employeeListLookupData)) {
                    employeeListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.employeeListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'اختار الموظف',
                        filterBarPlaceholder: 'Search',
                        sortOrder: 'Ascending',
                        allowFiltering: true,
                        filtering: (e) => {
                            e.preventDefaultAction = true;
                            let query = new ej.data.Query();
                            if (e.text !== '') {
                                query = query.where('name', 'startsWith', e.text, true);
                            }
                            e.updateData(state.employeeListLookupData, query);
                        },
                        change: (e) => {
                            state.employeeId = e.value;
                        }
                    });
                    employeeListLookup.obj.appendTo(employeeIdRef.value);
                }
            },
            refresh: () => {
                if (employeeListLookup.obj) {
                    employeeListLookup.obj.value = state.employeeId;
                }
            }
        };


        Vue.watch(
            () => state.employeeId,
            async (newVal, oldVal) => {
                employeeListLookup.refresh();
                state.errors.employeeId = '';


                await methods.populateProductsByEmployee(newVal);


                state.productId = null;
                productStatusLookup.refresh();
            }
        );
        const productListLookup = {
            obj: null,
            create: () => {
                productListLookup.obj = new ej.dropdowns.DropDownList({
                    dataSource: state.productListLookupData,
                    fields: { value: 'id', text: 'name' },
                    placeholder: 'اختار المنتج',
                    allowFiltering: true,
                    change: (e) => {
                        state.productId = e.value ? String(e.value) : null;
                    }
                });

                productListLookup.obj.appendTo(productIdRef.value);
            },
            refresh: () => {
                if (productListLookup.obj) {
                    productListLookup.obj.value = state.productId ?? null;
                }
            }
        };



        Vue.watch(
            () => state.productId,
            (newVal, oldVal) => {
                productListLookup.refresh();
                state.errors.productId = '';
            }
        );

        const productStatusData = [
            { id: 'مرتجع', name: 'مرتجع' },
            { id: 'كهنة', name: 'كهنة' }
        ];
        const productStatusLookup = {
            obj: null,
            create: () => {
                productStatusLookup.obj = new ej.dropdowns.DropDownList({
                    dataSource: productStatusData,
                    fields: { value: 'id', text: 'name' },
                    placeholder: 'اختر حالة المنتج',
                    allowFiltering: false,
                    value: state.productStatus,
                    change: (e) => {
                        state.productStatus = e.value;
                    }
                });
                productStatusLookup.obj.appendTo(productStatusRef.value);
            },
            refresh: () => {
                if (productStatusLookup.obj) {
                    productStatusLookup.obj.value = state.productStatus;
                }
            }
        };

        Vue.watch(
            () => state.productStatus,
            () => {
                productStatusLookup.refresh();
                state.errors.productStatus = '';
            }
        );


        const ItemReturnRequestsStatusListLookup = {
            obj: null,
            create: () => {
                if (state.ItemReturnRequestsStatusListLookupData && Array.isArray(state.ItemReturnRequestsStatusListLookupData)) {
                    ItemReturnRequestsStatusListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.ItemReturnRequestsStatusListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'اختر حالة الطلب',
                        change: (e) => {
                            state.orderStatus = e.value;
                        }
                    });
                    ItemReturnRequestsStatusListLookup.obj.appendTo(orderStatusRef.value);
                }
            },
            refresh: () => {
                if (ItemReturnRequestsStatusListLookup.obj) {
                    ItemReturnRequestsStatusListLookup.obj.value = state.orderStatus;
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
                ItemReturnRequestsStatusListLookup.refresh();
                state.errors.orderStatus = '';
            }
        );

        const mainGrid = {
            obj: null,
            create: async (dataSource) => {
                mainGrid.obj = new ej.grids.Grid({
                    locale: 'ar',
                    enableRtl: true,
                    height: '240px',
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
                        {
                            field: 'id', isPrimaryKey: true, headerText: 'المعرف', visible: false
                        },
                        { field: 'number', headerText: 'الرقم', width: 150, minWidth: 150 },
                        { field: 'orderDate', headerText: 'تاريخ الطلب', width: 150, format: 'yyyy-MM-dd' },
                        { field: 'orderStatusName', headerText: 'حالة الطلب' },
                        { field: 'employeeName', headerText: 'الموظف' },
                        { field: 'productName', headerText: 'المنتج' },
                        { field: 'productStatus', headerText: 'حالة المنتج' },
                        { field: 'unitPrice', headerText: 'السعر' },
                        { field: 'quantity', headerText: 'الكمية' },
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
                        mainGrid.obj.autoFitColumns(['number', 'orderDate', 'employeeName', 'orderStatusName', 'productName', 'productStatusName', 'unitPriceName', 'quantityName', 'afterproductAmount', 'createdAtUtc']);
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
                            state.mainTitle = 'اضافة إذن مرتجع';
                            resetFormState();

                            state.showComplexDiv = false;
                            mainModal.obj.show();
                        }

                        if (args.item.id === 'EditCustom') {
                            state.deleteMode = false;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'تعديل إذن المرتجع';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.orderDate = selectedRecord.orderDate ? new Date(selectedRecord.orderDate) : null;
                                state.committeeDecision = selectedRecord.committeeDecision ?? '';
                                state.unitPrice = selectedRecord.unitPrice ?? '';
                                state.quantity = selectedRecord.quantity ?? '';
                                state.employeeId = selectedRecord.employeeId ?? '';
                                state.productId = selectedRecord.productId ?? '';
                                state.productStatus = selectedRecord.productStatus ?? '';
                                productListLookup.trackingChange = true;
                                state.orderStatus = String(selectedRecord.orderStatus ?? '');
                                state.showComplexDiv = true;




                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'DeleteCustom') {
                            state.deleteMode = true;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'حذف إذن المرتجع?';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.orderDate = selectedRecord.orderDate ? new Date(selectedRecord.orderDate) : null;
                                state.committeeDecision = selectedRecord.committeeDecision ?? '';
                                state.unitPrice = selectedRecord.unitPrice ?? '';
                                state.quantity = selectedRecord.quantity ?? '';
                                state.employeeId = selectedRecord.employeeId ?? '';
                                state.productId = selectedRecord.productId ?? '';
                                state.productStatus = selectedRecord.productStatus ?? '';
                                state.orderStatus = String(selectedRecord.orderStatus ?? '');
                                state.showComplexDiv = false;




                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'PrintPDFCustom') {
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                window.open('/ItemReturnRequestss/ItemReturnRequestsPdf?id=' + (selectedRecord.id ?? ''), '_blank');
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
                await SecurityManager.authorizePage(['ItemReturnRequests']);
                await SecurityManager.validateToken();

                await methods.populateMainData();
                await mainGrid.create(state.mainData);

                mainModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                await methods.populateemployeeListLookupData();
                employeeListLookup.create();
                await methods.populateproductListLookupData();
                productListLookup.create();
                productStatusLookup.create();
                await methods.populateItemReturnRequestsStatusListLookupData();
                ItemReturnRequestsStatusListLookup.create();
                orderDatePicker.create();
                numberText.create();
             


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
            productIdRef,
            orderStatusRef,
            productStatusRef,
            state,
            methods,
            handler: {
                handleSubmit: methods.handleFormSubmit
            }
        };
    }
};

Vue.createApp(App).mount('#app');