ej.base.L10n.load({
    'ar': {
        'grid': {
            'EmptyRecord': 'لا توجد بيانات للعرض',
            'GroupDropArea': 'اسحب عنوان العمود هنا لتجميع البيانات',
            'UnGroup': 'اضغط لإلغاء التجميع',
            'Item': 'عنصر',
            'Items': 'عناصر',
            Add: 'إضافة',
            Edit: 'تعديل',
            Delete: 'حذف',
            Update: 'تحديث',
            Save: 'حفظ',
            Cancel: 'إلغاء',
            Close: 'إغلاق',

            /* البحث والتصدير */
            Search: 'بحث',
           

            
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
        const mainGridRef = Vue.ref(null);
        const mainModalRef = Vue.ref(null);
        const secondaryGridRef = Vue.ref(null);
        const examineDateRef = Vue.ref(null);
        const purchaseOrderIdRef = Vue.ref(null);
        const itemStatusRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const statusRef = Vue.ref(null);
        // ✅ دول لازم هنا
        const committeeDesionNumberRef = Vue.ref(null);
        const commiteeDateRef = Vue.ref(null);

        const refreshFormControls = async () => {
            await Vue.nextTick();

            examineDatePicker.obj?.dataBind();

            commiteeDatePicker.obj?.dataBind();
            committeeDesionNumberText.obj?.dataBind();

            purchaseOrderListLookup.obj?.dataBind();
            goodsExamineStatusListLookup.obj?.dataBind();
        };



        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            purchaseOrderListLookupData: [],
            goodsExamineStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            warehouseListLookupData: [],
            mainTitle: null,
            id: '',
                // بيانات اللجنة
            committeeList: [],


              
            committeeDesionNumberRef,
            commiteeDateRef,
            commiteeDate: null,
            committeeDesionNumber: '',
            number: '',
            examineDate: '',
            description: '',
            purchaseOrderId: null,
            status: null,
            errors: {
                examineDate: '',
                purchaseOrderId: '',

                status: '',
                description: ''
            },
            showComplexDiv: false,
            isSubmitting: false,
            totalMovementFormatted: '0.00'
        });

        

        const emptyCommitteeMember = () => ({
            id: null,
            tempId: crypto.randomUUID(), // 🔥 مهم
            goodsExamineId: '',
            employeeName: '',
            employeePositionName: '',
            employeeType: true,
            description: '',
            isDeleted: false   // ✅ جديد
        });


        const addCommitteeMember = () => {
            state.committeeList.push(emptyCommitteeMember());
        };

        const removeCommitteeMember = (index) => {
            const member = state.committeeList[index];

            // 🟢 لو موجود في DB
            if (member.id) {
                member.isDeleted = true;   // ✅ علّميه محذوف
            } else {
                // 🟢 لسه جديد → احذفيه من الواجهة
                state.committeeList.splice(index, 1);
            }
        };



        const validateForm = function () {
            state.errors.ExamineDate = '';
            state.errors.purchaseOrderId = '';
            state.errors.status = '';

            let isValid = true;

            if (!state.examineDate) {
                state.errors.examineDate = 'Examine date is required.';
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
            state.examineDate = '';
            state.description = '';
            state.commiteeDate = '';
            state.committeeDesionNumber = '';
            state.purchaseOrderId = null;
            state.status = null;
            state.errors = {
                examineDate: '',
                purchaseOrderId: '',
                status: '',
                description: ''
            };
            state.committeeList = [emptyCommitteeMember()];

            

            state.secondaryData = [];
            refreshFormControls();

        };
        const committeeDesionNumberText = {
            obj: null,
            create: () => {
                committeeDesionNumberText.obj = new ej.inputs.TextBox({
                    placeholder: 'رقم قرار اللجنة',
                    value: state.committeeDesionNumber,
                    input: (e) => {
                        state.committeeDesionNumber = e.value;
                    }
                });
                committeeDesionNumberText.obj.appendTo(committeeDesionNumberRef.value);
            },
            refresh: () => {
                if (committeeDesionNumberText.obj) {
                    committeeDesionNumberText.obj.value = state.committeeDesionNumber;
                }
            }
        };
        const commiteeDatePicker = {
            obj: null,
            create: () => {
                commiteeDatePicker.obj = new ej.calendars.DatePicker({
                    placeholder: 'اختر تاريخ اللجنة',
                    format: 'yyyy-MM-dd',
                    value: state.commiteeDate ? new Date(state.commiteeDate) : null,
                    change: (e) => {
                        state.commiteeDate = e.value;
                    }
                });
                commiteeDatePicker.obj.appendTo(commiteeDateRef.value);
            },
            refresh: () => {
                if (commiteeDatePicker.obj) {
                    commiteeDatePicker.obj.value =
                        state.commiteeDate ? new Date(state.commiteeDate) : null;
                }
            }
        };

        const examineDatePicker = {
            obj: null,
            create: () => {
                examineDatePicker.obj = new ej.calendars.DatePicker({
                    placeholder: 'اختر التاريخ',
                    format: 'yyyy-MM-dd',
                    value: state.examineDate ? new Date(state.examineDate) : null,
                    change: (e) => {
                        state.examineDate = e.value;
                    }
                });
                examineDatePicker.obj.appendTo(examineDateRef.value);
            },
            refresh: () => {
                if (examineDatePicker.obj) {
                    examineDatePicker.obj.value = state.examineDate ? new Date(state.examineDate) : null;
                }
            }
        };





        Vue.watch(() => state.commiteeDate, () => {
            commiteeDatePicker.refresh();
        });

        Vue.watch(() => state.committeeDesionNumber, () => {
            committeeDesionNumberText.refresh();
        });

        Vue.watch(
            () => state.examineDate,
            (newVal, oldVal) => {
                examineDatePicker.refresh();
                state.errors.examineDate = '';
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
        debugger;
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
                        change: async (e) => {
                            state.purchaseOrderId = e.value;

                            if (e.value) {
                                await methods.populateSecondaryData(e.value);
                            } else {
                                state.secondaryData = [];
                                if (secondaryGrid.obj) {
                                    secondaryGrid.obj.dataSource = [...state.secondaryData];
                                    secondaryGrid.obj.refresh(); // 🔥 السطر الناقص
                                }

                            }
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
            (newVal, oldVal) => {
                purchaseOrderListLookup.refresh();
                state.errors.purchaseOrderId = '';
            }
        );

        const goodsExamineStatusListLookup = {
            obj: null,
            create: () => {
                if (state.goodsExamineStatusListLookupData && Array.isArray(state.goodsExamineStatusListLookupData)) {
                    goodsExamineStatusListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.goodsExamineStatusListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'اختر الحالة',
                        allowFiltering: false,
                        change: (e) => {
                            state.status = e.value;
                        }
                    });
                    goodsExamineStatusListLookup.obj.appendTo(statusRef.value);
                }
            },
            refresh: () => {
                if (goodsExamineStatusListLookup.obj) {
                    goodsExamineStatusListLookup.obj.value = state.status
                }
            },
        };

        Vue.watch(
            () => state.status,
            (newVal, oldVal) => {
                goodsExamineStatusListLookup.refresh();
                state.errors.status = '';
            }
        );
       

        const services = {
            getMainData: async () => {
                try {
                    const response = await AxiosManager.get('/GoodsExamine/GetGoodsExamineList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            
            createMainData: async (

                examineDate,
                description,
                commiteeDate,
                committeeDesionNumber,
                status,
                purchaseOrderId,
                committeeList,
                createdById
            ) => {
                console.log("🔥 createMainData CALLED");
                try {
                    const payload = {
                        examineDate: examineDate ? new Date(examineDate).toISOString() : null,
                        description: description ?? '',
                        commiteeDate: commiteeDate ? new Date(commiteeDate).toISOString() : null,
                        committeeDesionNumber: committeeDesionNumber ?? '',
                        status: String(status ?? ''), // 👈 مهم
                        purchaseOrderId: purchaseOrderId ?? null,
                        committeeList: committeeList ?? [],
                        createdById: createdById ?? null
                    };

                    console.log(JSON.stringify(payload, null, 2));
                    const response = await AxiosManager.post(
                        '/GoodsExamine/CreateGoodsExamine',
                        JSON.stringify(payload),
                        {
                            headers: { 'Content-Type': 'application/json' }
                        }
                    );

                    return response;
                } catch (error) {
                    console.error(error);
                    throw error;
                }
            },


            updateMainData: async (id, examineDate, description, commiteeDate, committeeDesionNumber, status, purchaseOrderId, committeeList, updatedById) => {
 
                try {
                    const response = await AxiosManager.post('/GoodsExamine/UpdateGoodsExamine', {
                        id,
                        examineDate,
                        description,
                        commiteeDate,
                        committeeDesionNumber,
                        status,
                        purchaseOrderId,
                        committeeList,     // ✅ أضف هذا
                        updatedById
                    });

                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteMainData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/GoodsExamine/DeleteGoodsExamine', {
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
            getGoodsExamineStatusListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/GoodsExamine/GetGoodsExamineStatusList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getSecondaryData: async (purchaseOrderId) => {
                try {
                    const response = await AxiosManager.get('/PurchaseOrderItem/GetPurchaseOrderItemByPurchaseOrderIdList?purchaseOrderId=' + purchaseOrderId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            //createSecondaryData: async (moduleId, warehouseId, productId, movement, createdById, percentage,
            //    reasons,
            //    itemStatus,) => {
            //    try {
            //        const response = await AxiosManager.post('/InventoryTransaction/GoodsExamineCreateInvenTrans', {
            //            moduleId, warehouseId, productId, movement, createdById, percentage,
            //            reasons,
            //            itemStatus,
            //        });
            //        return response;
            //    } catch (error) {
            //        throw error;
            //    }
            //},
            updateSecondaryData: async (id, unitPrice, quantity, summary, productId, purchaseOrderId, updatedById, percentage,
                reasons, itemStatus) => {
                try {
                    const response = await AxiosManager.post('/PurchaseOrderItem/UpdatePurchaseOrderItem', {
                        id, unitPrice, quantity, summary, productId, purchaseOrderId, updatedById, percentage,
                          reasons,  itemStatus
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteSecondaryData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/PurchaseOrderItem/DeletePurchaseOrderItem', {
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
                    id: item.id,
                    number: item.number,
                    description: item.description,
                    purchaseOrderId: item.purchaseOrderId,
                    purchaseOrderNumber: item.purchaseOrderNumber,
                    status: item.status,
                    statusName: item.statusName,

                    // ✅ دول المهمين
                    committeeDesionNumber: item.committeeDesionNumber ?? '',
                    commiteeDate: item.commiteeDate ? new Date(item.commiteeDate) : null,

                    examineDate: item.examineDate ? new Date(item.examineDate) : null,
                    createdAtUtc: item.createdAtUtc ? new Date(item.createdAtUtc) : null,

                    committeeList: item.committeeList ?? []
                }));
          

            },


            populatePurchaseOrderListLookupData: async () => {
                const response = await services.getPurchaseOrderListLookupData();
                state.purchaseOrderListLookupData = response?.data?.content?.data;
            },
            populateGoodsExamineStatusListLookupData: async () => {
                const response = await services.getGoodsExamineStatusListLookupData();
                state.goodsExamineStatusListLookupData = response?.data?.content?.data;
            },
            populateProductListLookupData: async () => {
                const response = await services.getProductListLookupData();
                state.productListLookupData = response?.data?.content?.data
                    .filter(product => product.physical === true)
                    .map(product => ({
                        ...product,
                        numberName: `${product.number} - ${product.name}`
                    })) || [];
            },
            populateWarehouseListLookupData: async () => {
                const response = await services.getWarehouseListLookupData();
                state.warehouseListLookupData = response?.data?.content?.data.filter(warehouse => warehouse.systemWarehouse === false) || [];
            },
            populateSecondaryData: async (purchaseOrderId) => {
                try {
                    const response = await services.getSecondaryData(purchaseOrderId);

                    state.secondaryData = response?.data?.content?.data.map(item => ({
                        ...item,
                        productId: item.productId,
                        productName: item.productName ?? '',
                        productNumber: item.productNumber ?? '',
                        quantity: item.quantity ?? 0,
                        unitPrice: item.unitPrice ?? 0,
                        total: item.total ?? 0,
                        createdAtUtc: item.createdAtUtc ? new Date(item.createdAtUtc) : null
                    })) || [];

                    // 🔍 هنا بالظبط
                    console.log('secondaryData1111:', state.secondaryData.length);

                    if (secondaryGrid.obj) {
                        secondaryGrid.obj.dataSource = [...state.secondaryData];
                        secondaryGrid.obj.refresh();

                        // 🔍 وهنا كمان
                        console.log(
                            'grid ds:',
                            secondaryGrid.obj.dataSource?.length
                        );
                    }

                } catch (error) {
                    state.secondaryData = [];
                    if (secondaryGrid.obj) {
                        secondaryGrid.obj.dataSource = [];
                        secondaryGrid.obj.refresh();
                    }
                }
            },


            refreshSummary: () => {
                const totalMovement = state.secondaryData.reduce((sum, record) => sum + (record.movement ?? 0), 0);
                state.totalMovementFormatted = NumberFormatManager.formatToLocale(totalMovement);
            },
            onMainModalHidden: () => {
                state.errors.examineDate = '';
                state.errors.purchaseOrderId = '';
                state.errors.status = '';
            }
        };

        const handler = {
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));

                    console.log("🔥 clicked");

                    if (!validateForm()) {
                        console.log("❌ validation failed");
                        return;
                    }

                    // ⚡ نسخ نظيفة للجان قبل الإرسال
                    const cleanCommitteeList = state.committeeList.map(member => ({
                        id: member.id || null,
                        employeeName: member.employeeName,
                        employeePositionName: member.employeePositionName,
                        employeeType: member.employeeType,
                        description: member.description,
                        isDeleted: member.isDeleted === true
                    }));
                    console.log("state.id:", state.id);

                    const response = !state.id
                        ? await services.createMainData(
                            state.examineDate,
                            state.description,
                            state.commiteeDate ?? null,
                            state.committeeDesionNumber ?? null,
                            state.status,
                            state.purchaseOrderId,
                            cleanCommitteeList,
                            StorageManager.getUserId()
                        )
                        : state.deleteMode
                            ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(
                                state.id,
                                state.examineDate,
                                state.description,
                                state.commiteeDate ?? null,
                                state.committeeDesionNumber ?? null,
                                state.status,
                                state.purchaseOrderId,
                                cleanCommitteeList,
                                StorageManager.getUserId()
                            );

                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.obj.dataSource = [...state.mainData];
                        mainGrid.obj.refresh();




                        if (!state.deleteMode) {
                            state.mainTitle = 'تعديل طلب الفحص';
                            state.id = response?.data?.content?.data.id ?? '';
                            state.number = response?.data?.content?.data.number ?? '';
                            await methods.populateMainData();
                            mainGrid.obj.dataSource = [...state.mainData];
                            mainGrid.obj.refresh();

                          
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

                await SecurityManager.authorizePage(['GoodsExamine']);
                await SecurityManager.validateToken();

                await methods.populateMainData();
                await mainGrid.create(state.mainData);

                committeeDesionNumberText.create();
                commiteeDatePicker.create();
                examineDatePicker.create();

                mainModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                await methods.populatePurchaseOrderListLookupData();
                await methods.populateGoodsExamineStatusListLookupData();
                numberText.create();
                
                purchaseOrderListLookup.create();
                goodsExamineStatusListLookup.create();
                await methods.populateProductListLookupData();
                

                
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
                        { field: 'number', headerText: 'رقم طلب الفحص', width: 150, minWidth: 150 },
                        { field: 'examineDate', headerText: 'تاريخ الفحص', width: 150, format: 'yyyy-MM-dd' },
                        { field: 'purchaseOrderNumber', headerText: 'رقم أمر التوريد', width: 150, minWidth: 150 },
                        { field: 'statusName', headerText: 'الحالة', width: 150, minWidth: 150 },
                        { field: 'committeeDesionNumber', headerText: 'رقم القرار', width: 150, minWidth: 150 },
                        { field: 'commiteeDate', headerText: 'تاريخ اللجنة UTC', width: 150, format: 'yyyy-MM-dd HH:mm' },
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
                        mainGrid.obj.autoFitColumns(['number', 'examineDate', 'purchaseOrderNumber', 'statusName', 'committeeDesionNumber','commiteeDate','createdAtUtc']);
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
                            state.mainTitle = 'اضافة طلب فحص';
                            resetFormState();
                            state.showComplexDiv = false;
                            await Vue.nextTick(); // 🔥 مهم جدًا

                            if (!secondaryGrid.obj) {
                                await secondaryGrid.create(state.secondaryData);
                            } else {
                                secondaryGrid.obj.refresh();
                            }
                            mainModal.obj.show();
                        }

                        if (args.item.id === 'EditCustom') {
                            state.deleteMode = false;

                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];

                                state.mainTitle = 'تعديل طلب فحص';

                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.description = selectedRecord.description ?? '';
                                state.purchaseOrderId = selectedRecord.purchaseOrderId ?? '';
                                state.status = String(selectedRecord.status ?? '');

                                // ✅ التواريخ والنصوص
                                state.examineDate = selectedRecord.examineDate
                                    ? new Date(selectedRecord.examineDate)
                                    : null;

                                state.commiteeDate = selectedRecord.commiteeDate ? selectedRecord.commiteeDate.toISOString().split('T')[0] : null;


                                state.committeeDesionNumber = selectedRecord.committeeDesionNumber ?? '';
                                console.log(
                                    'committeeDesionNumber:', state.committeeDesionNumber,
                                    'commiteeDate:', state.commiteeDate
                                );

                               
                              


                                //// ✅ أهم 3 أسطر 🔥🔥🔥
                                //examineDatePicker.refresh();
                                //commiteeDatePicker.refresh();
                                //committeeDesionNumberText.refresh();
                                
                                // اللجنة
                                state.committeeList = selectedRecord.committeeList?.length
                                    ? selectedRecord.committeeList.map(c => ({
                                        id: c.id,
                                        tempId: crypto.randomUUID(),
                                        goodsExamineId: selectedRecord.id,
                                        employeeName: c.employeeName ?? '',
                                        employeePositionName: c.employeePositionName ?? '',
                                        employeeType: c.employeeType ?? true,
                                        description: c.description ?? ''
                                    }))
                                    : [emptyCommitteeMember()];

                                await methods.populateSecondaryData(selectedRecord.purchaseOrderId);
                                await Vue.nextTick();
                                refreshFormControls();


                                state.showComplexDiv = true;
                                await Vue.nextTick(); // 🔥 مهم جدًا

                                if (!secondaryGrid.obj) {
                                    await secondaryGrid.create(state.secondaryData);
                                } else {
                                    secondaryGrid.obj.refresh();
                                }
                                mainModal.obj.show();
                                setTimeout(() => {
                                    refreshFormControls();
                                }, 200);
                            }
                        }


                        if (args.item.id === 'DeleteCustom') {
                            state.deleteMode = true;
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                state.mainTitle = 'حذف اذن الفحص?';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                state.examineDate = selectedRecord.examineDate ? new Date(selectedRecord.examineDate) : null;
                                state.description = selectedRecord.description ?? '';
                                state.purchaseOrderId = selectedRecord.purchaseOrderId ?? '';
                                state.status = String(selectedRecord.status ?? '');
                                state.commiteeDate = selectedRecord.commiteeDate ? new Date(selectedRecord.commiteeDate) : null;
                                state.committeeDesionNumber = String(selectedRecord.committeeDesionNumber ?? '');
                                await Vue.nextTick();
                                refreshFormControls();


                                await methods.populateSecondaryData(selectedRecord.purchaseOrderId);
                              
                                state.showComplexDiv = true;
                                await Vue.nextTick(); // 🔥 مهم جدًا

                                if (!secondaryGrid.obj) {
                                    await secondaryGrid.create(state.secondaryData);
                                } else {
                                    secondaryGrid.obj.refresh();
                                }
                                mainModal.obj.show();
                            }
                        }

                        if (args.item.id === 'PrintPDFCustom') {
                            if (mainGrid.obj.getSelectedRecords().length) {
                                const selectedRecord = mainGrid.obj.getSelectedRecords()[0];
                                window.open('/GoodsExamine/GoodsExaminePdf?id=' + (selectedRecord.id ?? ''), '_blank');
                            }
                        }
                    }
                });

                mainGrid.obj.appendTo(mainGridRef.value);
            },
            refresh: () => {
                if (!mainGrid.obj) return;
                mainGrid.obj.dataSource = [...state.mainData];
                mainGrid.obj.refresh();
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
                    editSettings: { allowEditing: true, allowAdding: false, allowDeleting: false, showDeleteConfirmDialog: true, mode: 'Normal', allowEditOnDblClick: true },
                    allowFiltering: false,
                    allowSorting: true,
                    allowSelection: true,
                    allowGrouping: false,
                    allowTextWrap: true,
                    locale: 'ar',
                    enableRtl: true,
                    allowResizing: true,
                    allowPaging: false,
                    allowExcelExport: true,
                    filterSettings: { type: 'CheckBox' },
                    sortSettings: { columns: [] },

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
                            field: 'productId',
                            headerText: 'المنتج',
                            width: 250,
                            allowEditing: false,
                            valueAccessor: (field, data) => {
                                return data.productName || data.productNumber || '';
                            }
                        },

                        {
                            field: 'unitPrice',
                            headerText: 'سعر المنتج',
                            width: 200, validationRules: { required: true }, type: 'number', format: 'N2', textAlign: 'Right',
                            allowEditing: false,
                            edit: {
                                create: () => {
                                    let priceElem = document.createElement('input');
                                    return priceElem;
                                },
                                read: () => {
                                    return priceObj.value;
                                },
                                destroy: () => {
                                    priceObj.destroy();
                                },
                                write: (args) => {
                                    priceObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.unitPrice ?? 0,
                                        readonly: true,
                                        change: (e) => {
                                            if (quantityObj && totalObj) {
                                                const total = e.value * quantityObj.value;
                                                totalObj.value = total;
                                                
                                            }
                                        }
                                    });
                                    priceObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'quantity',
                            headerText: 'الكمية',
                            width: 200,
                            allowEditing: false,
                            validationRules: {
                                required: true,
                                custom: [(args) => {
                                    return args['value'] > 0;
                                }, 'يجب ان يكون الرقم موجب']
                            },
                            type: 'number', format: 'N2', textAlign: 'Right',
                            edit: {
                                create: () => {
                                    let quantityElem = document.createElement('input');
                                    return quantityElem;
                                },
                                read: () => {
                                    return quantityObj.value;
                                },
                                destroy: () => {
                                    quantityObj.destroy();
                                },
                                write: (args) => {
                                    quantityObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.quantity ?? 0,
                                        change: (e) => {
                                            if (priceObj && totalObj) {
                                                const total = e.value * priceObj.value;
                                                totalObj.value = total;
                                            }
                                        }
                                    });
                                    quantityObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'total',
                            headerText: 'الاجمالي',
                            allowEditing: false,
                            width: 200, validationRules: { required: false }, type: 'number', format: 'N2', textAlign: 'Right',
                            edit: {
                                create: () => {
                                    let totalElem = document.createElement('input');
                                    return totalElem;
                                },
                                read: () => {
                                    return totalObj.value;
                                },
                                destroy: () => {
                                    totalObj.destroy();
                                },
                                write: (args) => {
                                    totalObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.total ?? 0,
                                        readonly: true
                                    });
                                    totalObj.appendTo(args.element);
                                }
                            }
                        },
                       
                         {
                            field: 'summary',
                             headerText: 'المواصفات',
                             allowEditing: false,
                            width: 200,
                            edit: {
                                create: () => {
                                    let summaryElem = document.createElement('input');
                                    return summaryElem;
                                },
                                read: () => {
                                    return summaryObj.value;
                                },
                                destroy: () => {
                                    summaryObj.destroy();
                                },
                                write: (args) => {
                                    summaryObj = new ej.inputs.TextBox();
                                    summaryObj.value = args.rowData.summary;
                                    summaryObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'percentage',
                            headerText: ' النسبة المئوية',
                            width: 120,
                            editType: 'stringedit'
                        },
                        {
                            field: 'reasons',
                            headerText: 'الأسباب',
                            width: 250,
                            editType: 'stringedit'
                        },
                        {
                            field: 'itemStatus',
                            headerText: 'الحالة',
                            width: 150,
                            valueAccessor: (field, data) => {
                                if (data[field] === true) return 'مقبول';
                                if (data[field] === false) return 'مرفوض';
                                return '';
                            },
                            editType: 'dropdownedit',
                            edit: {
                                create: () => document.createElement('input'),
                                write: (args) => {
                                    itemStatusObj = new ej.dropdowns.DropDownList({
                                        dataSource: [
                                            { text: 'مقبول', value: true },
                                            { text: 'مرفوض', value: false }
                                        ],
                                        fields: { text: 'text', value: 'value' },
                                        value: args.rowData.itemStatus
                                    });
                                    itemStatusObj.appendTo(args.element);
                                },
                                read: () => itemStatusObj.value,
                                destroy: () => itemStatusObj.destroy()
                            }
                        }



                    ],
                    toolbar: [
                        'ExcelExport',
                        { type: 'Separator' },
                        'Edit', 'Delete', 'Update', 'Cancel',
                    ],
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

                        if (!state.id && (args.requestType === 'save' || args.requestType === 'delete')) {
                            Swal.fire({
                                icon: 'warning',
                                title: 'تنبيه',
                                text: 'يجب حفظ إذن الفحص أولاً قبل إضافة المنتجات'
                            });
                            secondaryGrid.obj.refresh();
                            return;
                        }
                        //if (args.requestType === 'save' && args.action === 'add') {
                        //    try {
                        //        const response = await services.createSecondaryData(
                        //            state.id,                      // moduleId
                        //            args.data.warehouseId,
                        //            args.data.productId,
                        //            args.data.movement,
                        //            StorageManager.getUserId(),    // createdById ✅
                        //            args.data.percentage,
                        //            args.data.reasons,
                        //            args.data.itemStatus
                        //        );

                               

                        //        if (response.data.code === 200) {
                        //            await methods.populateSecondaryData(state.id);
                                    

                        //            Swal.fire({
                        //                icon: 'success',
                        //                title: 'تم الحفظ',
                        //                timer: 2000,
                        //                showConfirmButton: false
                        //            });
                        //        } else {
                        //            secondaryGrid.refresh(); // يرجشقل البيانات الأصلية
                        //            Swal.fire({
                        //                icon: 'error',
                        //                title: 'فشل الحفظ',
                        //                text: response.data.message ?? 'يرجى التحقق من البيانات',
                        //            });
                        //        }

                        //    } catch (error) {
                        //        secondaryGrid.refresh();
                        //        Swal.fire({
                        //            icon: 'error',
                        //            title: 'حدث خطأ',
                        //            text: error.response?.data?.message ?? 'يرجى المحاولة مرة أخرى'
                        //        });
                        //    }
                        //}

                        if (args.requestType === 'save' && args.action === 'edit') {
                            const purchaseOrderId = state.purchaseOrderId;
                            const userId = StorageManager.getUserId();
                            const data = args.data;

                            await services.updateSecondaryData(data?.id, data?.unitPrice, data?.quantity, data?.summary, data?.productId, purchaseOrderId, userId, data?.percentage,data?.reasons,data?.itemStatus);
                            await methods.populateSecondaryData(purchaseOrderId);
                            secondaryGrid.refresh();

                            Swal.fire({
                                icon: 'success',
                                title: 'تم الحفظ',
                                timer: 2000,
                                showConfirmButton: false
                            });
                        }

                        if (args.requestType === 'delete') {
                            try {
                                const response = await services.deleteSecondaryData(args.data[0].id, StorageManager.getUserId());
                                await methods.populateSecondaryData(state.purchaseOrderId);
                               
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
            dataBound: function () {
                secondaryGrid.obj.toolbarModule.enableItems(
                    ['Add'],
                    !!state.id // يفعل الإضافة فقط بعد الحفظ
                );
            },

            refresh: () => {
                secondaryGrid.obj.dataSource = [...state.secondaryData];
                secondaryGrid.obj.refresh();
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
            examineDateRef,
            purchaseOrderIdRef,
            statusRef,
            state,

            handler,
            addCommitteeMember,
            removeCommitteeMember,
        };
    }
};

Vue.createApp(App).mount('#app');
