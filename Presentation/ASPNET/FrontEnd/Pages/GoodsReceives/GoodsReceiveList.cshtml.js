/* (unchanged header localization) */
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
            itemReturnListLookupData: [],
            warehouseLookupData: [],
            transType: 1, // default 1 = PurchaseOrder, 2 = ReturnRequest
            mainTitle: null,
            id: '',
            number: '',
            receiveDate: '',
            description: '',
            warehouseId: '',
            purchaseOrderId: null,
            returnRequestId: null,
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
        const TransTypeRef = Vue.ref(null);
        const ReturnRequestRef = Vue.ref(null);
        const warehouseRef = Vue.ref(null);
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
                state.errors.receiveDate = 'تاريخ الاستلام مطلوب';
                isValid = false;
            }
            // validation depends on transType: if PurchaseOrder require purchaseOrderId, else require returnRequestId
            if (state.transType === 1 && !state.purchaseOrderId) {
                state.errors.purchaseOrderId = 'امر التوريد مطلوب';
                isValid = false;
            }
            if (state.transType === 2 && !state.returnRequestId) {
                state.errors.purchaseOrderId = 'اذن الارتجاع مطلوب';
                isValid = false;
            }
            if (!state.status) {
                state.errors.status = 'الحالة مطلوبة.';
                isValid = false;
            }
            if (!state.warehouseId) {
                state.errors.warehouseId = 'المخزن مطلوب';
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
            state.returnRequestId = null;
            state.status = null;
            state.errors = {
                receiveDate: '',
                purchaseOrderId: '',
                status: '',
                description: ''
            };
            state.secondaryData = [];
            methods.refreshSummary();
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

                    // if creating a new GR (no id yet), prefill UI secondaryData with PO items
                    if (!state.id) {
                        state.secondaryData = state.productListLookupData.map(p => ({
                            id: null,
                            purchaseOrderItemId: p.purchaseOrderItemId,
                            productId: p.id,
                            unitPrice: p.unitPrice ?? 0,
                            quantity: p.quantity ?? 0,
                            movement: p.quantity ?? 0, // default movement = available qty
                            warehouseId: state.warehouseId || null,
                            createdAtUtc: new Date()
                        }));
                        secondaryGrid.refresh();
                        methods.refreshSummary();
                    } else {
                        await methods.populateSecondaryData(state.id);
                        secondaryGrid.refresh();
                    }
                } else {
                    state.productListLookupData = [];
                    state.secondaryData = [];
                    secondaryGrid.refresh();
                    methods.refreshSummary();
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

        // TransType simple select control
        const transTypeControl = {
            create: () => {
                const container = TransTypeRef.value;
                if (!container) return;
                container.innerHTML = '';
                const select = document.createElement('select');
                select.id = 'TransType';
                select.className = 'form-select';
                select.innerHTML = `
                    <option value="1">أمر التوريد</option>
                    <option value="2">أذن ارتجاع</option>
                     <option value="3">أذن صرف</option>
                     <option value="4">كشف الزيادة</option>
                     <option value="5">شهادةإدارية</option>
                `;
                select.value = String(state.transType || 1);
                select.addEventListener('change', () => {
                    state.transType = parseInt(select.value);
                });
                container.appendChild(select);
            },
            refresh: () => {
                const sel = document.getElementById('TransType');
                if (sel) sel.value = String(state.transType || 1);
            }
        };

        // ReturnRequest DropDownList
        let returnRequestObj = null;
        const returnRequestLookup = {
            create: () => {
                if (!ReturnRequestRef.value) return;
                returnRequestObj = new ej.dropdowns.DropDownList({
                    dataSource: state.itemReturnListLookupData,
                    fields: { value: 'id', text: 'number' },
                    placeholder: 'اختر اذن الارتجاع',
                    allowFiltering: true,
                    change: (e) => {
                        state.returnRequestId = e.value;
                    }
                });
                returnRequestObj.appendTo(ReturnRequestRef.value);
            },
            refresh: () => {
                if (returnRequestObj) {
                    returnRequestObj.dataSource = state.itemReturnListLookupData;
                    returnRequestObj.value = state.returnRequestId;
                }
            },
            destroy: () => {
                if (returnRequestObj) {
                    returnRequestObj.destroy();
                    returnRequestObj = null;
                }
            }
        };

        const warehouseLookup = {
            obj: null,
            create: () => {
                warehouseLookup.obj = new ej.dropdowns.DropDownList({
                    dataSource: state.warehouseListLookupData,
                    fields: { value: 'id', text: 'name' },
                    placeholder: 'اختر المخزن',
                    change: (e) => {
                        state.warehouseId = e.value;
                        state.errors.warehouseId = '';
                        // update any existing secondary rows default warehouse
                        state.secondaryData.forEach(r => { if (!r.warehouseId) r.warehouseId = e.value; });
                        secondaryGrid.refresh();
                        methods.refreshSummary();
                    }
                });
                warehouseLookup.obj.appendTo(warehouseRef.value);
            },
            refresh: () => {
                if (warehouseLookup.obj) {
                    warehouseLookup.obj.dataSource = state.warehouseListLookupData;
                    warehouseLookup.obj.value = state.warehouseId;
                }
            }
        };

        Vue.watch(
            () => state.status,
            (newVal, oldVal) => {
                goodsReceiveStatusListLookup.refresh();
                state.errors.status = '';
            }
        );

        // show/hide purchase vs return divs when transType changes
        Vue.watch(() => state.transType, (val) => {
            const purchaseDiv = document.getElementById('PurchaseDiv');
            const returnDiv = document.getElementById('ReturnDiv');
            if (purchaseDiv) purchaseDiv.style.display = val === 1 ? 'block' : 'none';
            if (returnDiv) returnDiv.style.display = val === 2 ? 'block' : 'none';
            transTypeControl.refresh();
        });

        const services = {
            getMainData: async () => {
                try {
                    const response = await AxiosManager.get('/GoodsReceive/GetGoodsReceiveList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createMainData: async (receiveDate, description, status, purchaseOrderId, createdById, warehouseId, returnRequestId, transType) => {
                try {
                    const response = await AxiosManager.post('/GoodsReceive/CreateGoodsReceive', {
                        receiveDate, description, status, purchaseOrderId, createdById, warehouseId, returnRequestId, transType
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateMainData: async (
                id,
                receiveDate,
                description,
                status,
                purchaseOrderId,
                updatedById,
                warehouseId,
                productId,
                returnRequestId,
                transType,
                inventoryTransactionId ,
            ) => {
                try {
                    const payload = {
                        id,
                        receiveDate,
                        description,
                        status,
                        purchaseOrderId,
                        updatedById,
                        warehouseId,
                        returnRequestId,
                        transType
                    };

                    // ✅ ابعتي productId فقط لو له قيمة
                    if (inventoryTransactionId) {
                        payload.inventoryTransactionId = inventoryTransactionId;
                    }

                    const response = await AxiosManager.post(
                        '/GoodsReceive/UpdateGoodsReceive',
                        payload
                    );

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
            // <-- new: item return lookup
            getItemReturnRequestsLookup: async () => {
                try {
                    const response = await AxiosManager.get('/ItemReturnRequests/GetItemReturnRequestsList', {});
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

                state.warehouseListLookupData =
                    response?.data?.content?.data
                        .filter(warehouse => warehouse.systemWarehouse === true) || [];

                warehouseLookup.refresh();
            },

            // <-- new: populate item return lookup
            populateItemReturnLookup: async () => {
                try {
                    const resp = await services.getItemReturnRequestsLookup();
                    state.itemReturnListLookupData = resp?.data?.content?.data ?? [];
                    // if return dropdown already created, refresh it
                    returnRequestLookup.refresh();
                } catch {
                    state.itemReturnListLookupData = [];
                }
            },

            populateProductListByPurchaseOrder: async (purchaseOrderId) => {
                const response = await services.getPurchaseOrderItems(purchaseOrderId);
                const items = response?.data?.content?.data || [];

                state.productListLookupData = items
                    .filter(x => x.itemStatus === true) // المقبول فقط
                    .map(x => ({
                        id: x.productId,
                        purchaseOrderItemId: x.id,
                        unitPrice: x.unitPrice ?? 0,
                        quantity: x.quantity ?? 0,
                        numberName: `${x.productNumber} - ${x.productName}`
                    }));
                purchaseOrderListLookup.refresh();
                goodsReceiveStatusListLookup.refresh();
                warehouseLookup.refresh();
            },

            populateSecondaryData: async (goodsReceiveId) => {
                try {
                    const response = await services.getSecondaryData(goodsReceiveId);
                    const transactions = response?.data?.content?.data || [];

                    state.secondaryData = transactions.map(item => {

                        const product = state.productListLookupData.find(
                            p => String(p.id) === String(item.productId)
                        );

                        // ✅ لو المنتج موجود → خدي منه القيم
                        if (product) {
                            return {
                                ...item,
                                unitPrice: Number(product.unitPrice ?? 0),
                                quantity: Number(product.quantity ?? 0),
                                purchaseOrderItemId: product.purchaseOrderItemId ?? null,
                                createdAtUtc: item.createdAtUtc ? new Date(item.createdAtUtc) : null
                            };
                        }

                        // ✅ fallback لو مش موجود
                        return {
                            ...item,
                            unitPrice: Number(item.unitPrice ?? 0),
                            quantity: Number(item.quantity ?? 0),
                            purchaseOrderItemId: item.purchaseOrderItemId ?? null,
                            createdAtUtc: item.createdAtUtc ? new Date(item.createdAtUtc) : null
                        };
                    });

                    secondaryGrid.refresh(); // 🔥 مهم جداً
                    methods.refreshSummary();

                } catch (error) {
                    console.error("❌ populateSecondaryData error:", error);
                    state.secondaryData = [];
                    secondaryGrid.refresh();
                    methods.refreshSummary();
                }
            },
            refreshSummary: () => {
                // sum of movement * unitPrice
                const totalAmount = state.secondaryData.reduce((sum, record) => {
                    const amt = (Number(record.unitPrice) || 0) * (Number(record.movement) || 0);
                    return sum + amt;
                }, 0);
                state.totalMovementFormatted = NumberFormatManager.formatToLocale(totalAmount);
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
                    
                    const selectedRow = secondaryGrid.obj.getSelectedRecords()[0]; // أو حسب اختيارك
                    const productId = selectedRow?.productId ?? null;
                    await services.updateMainData(
                        state.id,
                        state.receiveDate,
                        state.description,
                        state.status,
                        state.purchaseOrderId,
                        StorageManager.getUserId(),
                        state.warehouseId,
                        productId // لازم يبقى موجود هنا
                    );

                    const response = state.id === ''
                        ? await services.createMainData(state.receiveDate, state.description, state.status, state.purchaseOrderId, StorageManager.getUserId(), state.warehouseId)
                        : state.deleteMode
                            ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(state.id, state.receiveDate, state.description, state.status, state.purchaseOrderId, StorageManager.getUserId(), state.warehouseId, state.productId);

                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            state.mainTitle = 'تعديل اذن الاضافة';
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
                warehouseLookup.create();

                // load item return lookup and create control
                await methods.populateItemReturnLookup();
                transTypeControl.create();
                returnRequestLookup.create();

                // initial hide/show
                const purchaseDiv = document.getElementById('PurchaseDiv');
                const returnDiv = document.getElementById('ReturnDiv');
                if (purchaseDiv) purchaseDiv.style.display = state.transType === 1 ? 'block' : 'none';
                if (returnDiv) returnDiv.style.display = state.transType === 2 ? 'block' : 'none';

            } catch (e) {
                console.error('page init error:', e);
            } finally {

            }
        });

        Vue.onUnmounted(() => {
            mainModalRef.value?.removeEventListener('hidden.bs.modal', methods.onMainModalHidden);
            // destroy dropdown instances
            if (returnRequestLookup) returnRequestLookup.destroy?.();
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
                        { field: 'number', headerText: 'رقم اذن الاضافة', width: 150, minWidth: 150 },
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
                                
                                state.warehouseId = selectedRecord.warehouseId ?? '';
                                warehouseLookup.refresh(); // ✅ الحل هنا

                                state.mainTitle = 'تعديل اذن اضافة';
                                state.id = selectedRecord.id ?? '';
                                state.number = selectedRecord.number ?? '';
                                
                                state.receiveDate = selectedRecord.receiveDate
                                    ? new Date(selectedRecord.receiveDate)
                                    : null;
                                state.description = selectedRecord.description ?? '';
                                state.purchaseOrderId = selectedRecord.purchaseOrderId ?? '';
                                state.returnRequestId = selectedRecord.returnRequestId ?? null;
                                state.status = String(selectedRecord.status ?? '');

                                await methods.populateProductListByPurchaseOrder(state.purchaseOrderId);
                                await methods.populateSecondaryData(state.id);

                                // refresh lookups to reflect loaded values
                                purchaseOrderListLookup.refresh();
                                returnRequestLookup.refresh();
                                warehouseLookup.refresh();
                                goodsReceiveStatusListLookup.refresh();

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
                    rowSelected: (args) => {
                        state.inventoryTransactionId = args.data.id;
                        console.log('Selected InventoryTransactionId:', state.inventoryTransactionId);

                    },
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
                            headerText: 'المخزن',
                            width: 200,
                            visible: false,
                            editType: 'dropdownedit',
                            validationRules: { required: true },
                            edit: {
                                create: () => document.createElement('input'),
                                write: (args) => {
                                    const warehouseObj = new ej.dropdowns.DropDownList({
                                        dataSource: state.warehouseListLookupData,
                                        fields: { value: 'id', text: 'name' },
                                        value: args.rowData.warehouseId, // ✅ القيمة الحالية للصف
                                        placeholder: 'اختر المخزن',
                                        change: (e) => {
                                            args.rowData.warehouseId = e.value; // ✅ تحديث rowData مباشرة
                                        }
                                    });
                                    warehouseObj.appendTo(args.element);
                                },
                                read: (args) => {
                                    return args.element.ej2_instances[0].value;
                                },
                                destroy: (args) => {
                                    args.element.ej2_instances[0].destroy();
                                }
                            }
                        },


                        {
                            field: 'productId',
                            headerText: 'المنتج',
                            width: 250,
                            validationRules: { required: true },
                            disableHtmlEncode: false,
                            valueAccessor: (field, data) => {
                                const product = state.productListLookupData.find(
                                    item => String(item.id) === String(data.productId)
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
                                        dataSource: state.productListLookupData.filter(p =>
                                            p.purchaseOrderItemId !== null // المقبول فقط
                                        ),
                                        fields: { value: 'id', text: 'numberName' },
                                        value: args.rowData.productId,
                                        change: function (e) {
                                            const selected = state.productListLookupData.find(
                                                p => String(p.id) === String(e.value)
                                            );

                                            if (selected) {
                                                args.rowData.purchaseOrderItemId = selected.purchaseOrderItemId;
                                                args.rowData.unitPrice = selected.unitPrice;
                                                args.rowData.quantity = selected.quantity;
                                            }

                                            if (movementObj) {
                                                movementObj.value = 1;
                                            }
                                            // refresh summary live
                                            methods.refreshSummary();
                                        },
                                        placeholder: 'اختر المنتج',
                                        floatLabelType: 'Never'
                                    });

                                    productObj.appendTo(args.element);
                                }


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
                                            // update model and summary when price changes (if ever)
                                            args.rowData.unitPrice = e.value;
                                            methods.refreshSummary();
                                        }
                                    });
                                    priceObj.appendTo(args.element);
                                }
                            }
                        },
                        {
                            field: 'quantity',
                            headerText: ' الكمية امر التوريد',
                            width: 200,
                            type: 'number',
                            format: 'N2',
                            textAlign: 'Right',
                            allowEditing: false, // ✅ Read-Only
                        },

                        {
                            field: 'movement',
                            headerText: 'الكمية المدخلة',
                            width: 200,
                            type: 'number',
                            format: 'N2',
                            textAlign: 'Right',
                            validationRules: {
                                required: true
                            },
                            edit: {
                                create: () => document.createElement('input'),
                                read: () => movementObj.value,
                                destroy: () => movementObj.destroy(),
                                write: (args) => {
                                    movementObj = new ej.inputs.NumericTextBox({
                                        value: args.rowData.movement ?? 0,
                                        change: (e) => {
                                            // keep the row model updated while editing so amount and summary update live
                                            args.rowData.movement = e.value;
                                            methods.refreshSummary();
                                        }
                                    });
                                    movementObj.appendTo(args.element);
                                }
                            }
                        },

                        // NEW amount column (movement * unitPrice)
                        {
                            field: 'amount',
                            headerText: 'القيمة',
                            width: 200,
                            textAlign: 'Right',
                            valueAccessor: (field, data) => {
                                const amt = (Number(data.unitPrice) || 0) * (Number(data.movement) || 0);
                                return NumberFormatManager.formatToLocale(amt);
                            }
                        },

                    ],
                    toolbar: [
                        { text: 'تصدير إكسل', tooltipText: 'تصدير إلى Excel', prefixIcon: 'e-excelexport', id: 'SecondaryGrid_excelexport' },

                        { type: 'Separator' },
                        'Edit', 'Delete', 'Update', 'Cancel',
                    ],
                    actionBegin: (args) => {
                        if (args.requestType === 'add') {
                            args.data.purchaseOrderItemId = null;
                            args.data.unitPrice = 0;
                        }

                        if (args.requestType === 'save') {

                            const movement = Number(args.data.movement ?? 0);
                            const quantity = Number(args.data.quantity ?? 0);

                            if (movement <= 0) {
                                args.cancel = true;
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'قيمة غير صحيحة',
                                    text: 'الحركة يجب أن تكون رقمًا موجبًا'
                                });
                                return;
                            }

                            if (movement > quantity) {
                                args.cancel = true; // ❌ منع الحفظ
                                Swal.fire({
                                    icon: 'error',
                                    title: 'خطأ في الكمية',
                                    text: '❌ الحركة لا يمكن أن تكون أكبر من الكمية'
                                });
                                return;
                            }
                            const product = state.productListLookupData.find(
                                p => String(p.id) === String(args.data.productId)
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
                                const response = await services.createSecondaryData(
                                    state.id,
                                    state.warehouseId, // ✅ هنا الصح
                                    args.data.productId,
                                    args.data.movement,
                                    StorageManager.getUserId(),
                                    args.data.purchaseOrderItemId
                                );
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
                                    state.warehouseId, // ✅
                                    args.data.productId,
                                    args.data.movement,
                                    StorageManager.getUserId(),
                                    args.data.purchaseOrderItemId
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
            TransTypeRef,
            ReturnRequestRef,
            warehouseRef,
            state,
            handler
        };
    }
};

Vue.createApp(App).mount('#app');