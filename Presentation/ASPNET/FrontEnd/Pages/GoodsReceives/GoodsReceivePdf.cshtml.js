function numberToArabicWordsWithPiasters(amount) {

    if (amount === null || amount === undefined || isNaN(amount))
        return "صفر جنيه مصري فقط لا غير";

    const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
    const tens = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
    const teens = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر",
        "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
    const hundreds = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة",
        "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];

    function convert(n) {
        let result = "";

        if (n >= 100) {
            result += hundreds[Math.floor(n / 100)];
            n %= 100;
            if (n > 0) result += " و ";
        }

        if (n >= 20) {
            if (n % 10 !== 0) result += ones[n % 10] + " و ";
            result += tens[Math.floor(n / 10)];
        } else if (n >= 10) {
            result += teens[n - 10];
        } else if (n > 0) {
            result += ones[n];
        }

        return result;
    }

    let parts = Number(amount).toFixed(2).split('.');
    let pounds = parseInt(parts[0]);
    let piasters = parseInt(parts[1]);

    let words = "";

    // ===== الجنيهات =====
    if (pounds > 0) {
        if (pounds < 1000) {
            words = convert(pounds);
        } else {
            let thousands = Math.floor(pounds / 1000);
            let remainder = pounds % 1000;

            if (thousands === 1) words = "ألف";
            else if (thousands === 2) words = "ألفان";
            else if (thousands <= 10) words = convert(thousands) + " آلاف";
            else words = convert(thousands) + " ألف";

            if (remainder > 0)
                words += " و " + convert(remainder);
        }

        words += " جنيهًا مصريًا";
    } else {
        words = "صفر جنيه مصري";
    }

    // ===== القروش =====
    if (piasters > 0) {
        words += " و " + convert(piasters) + " قرشًا";
    }

    return words + " فقط لا غير";
}


const App = {
 
    setup() {
        const state = Vue.reactive({
            company: {
                name: '',
                emailAddress: '',
                phoneNumber: '',
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
            },
            companyAddress: '',
            vendor: {
                name: '',
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                emailAddress: '',
                phoneNumber: ''
            },
            vendorAddress: '',
            number: '',
            date: '',
            reference: '',
            pdfTransactionList: [],
            isDownloading: false,
            mappedItems: [],
            movementTotal: 0
        });

        const services = {
            getPDFData: async (id) => {
                try {
                    const response = await AxiosManager.get('/GoodsReceive/GetGoodsReceiveSingle?id=' + id, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
        };

        const methods = {
            populatePDFData: async (id) => {
                const response = await services.getPDFData(id);
                state.pdfData = response?.data?.content?.data || {};
                state.pdfTransactionList = response?.data?.content?.transactionList || [];
                methods.bindPDFControls();
            },
            bindPDFControls: () => {

                /* ===== بيانات الشركة ===== */
                const company = StorageManager.getCompany() || state.company;
                state.company = {
                    name: company.name,
                    emailAddress: company.emailAddress,
                    phoneNumber: company.phoneNumber,
                    street: company.street,
                    city: company.city,
                    state: company.state,
                    zipCode: company.zipCode,
                    country: company.country
                };

                /* ===== بيانات المستند ===== */
                const pdfData = state.pdfData;
                //state.createdBy = SecurityManager.getUser()?.fullName || '';

                state.vendor = pdfData.purchaseOrder?.vendor || {};
                state.date = DateFormatManager.formatToLocale(pdfData?.receiveDate) || '';
                state.number = pdfData?.number || '';

                /* ✅ اسم المخزن (هنا 👇) */
                state.warehouseName =
                    state.pdfTransactionList?.[0]?.warehouse?.name || '';

                /* ===== Mapping الأصناف ===== */
                /* ===== Mapping الأصناف (المقبولة فقط) ===== */
                const poItems = pdfData?.purchaseOrder?.purchaseOrderItemList || [];
                console.log('Transactions:', state.pdfTransactionList);
                console.log('PO Items:', poItems);

                state.mappedItems = state.pdfTransactionList
                    .map(trx => {
                        const poItem = poItems.find(
                            x => x.productId === trx.productId
                        );

                        // ✅ عرض الأصناف المقبولة فقط
                        if (!poItem || poItem.itemStatus !== true) return null;

                        const qty = trx.movement ?? 0;
                        const price = poItem.unitPrice ?? 0;
                        const amount = qty * price;

                        return {
                            product: `${trx.product?.number || ''} ${trx.product?.name || ''}`,
                            unit: trx.product?.unitMeasure?.name || '',
                            movement: qty,
                            unitPrice: price,
                            value: amount,
                            amount: amount,
                            status: 'مقبول',
                            notes: poItem.reasons || ''
                        };
                    })
                    .filter(Boolean);


                /* ===== الإجمالي ===== */
                const total = state.mappedItems.reduce(
                    (sum, item) => sum + item.amount,
                    0
                );

                state.movementTotal = NumberFormatManager.formatToLocale(total);
                state.amountInWords = numberToArabicWordsWithPiasters(total);
            }



        };

        const handler = {
            downloadPDF: async () => {
                state.isDownloading = true;
                await new Promise(resolve => setTimeout(resolve, 500));

                try {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF('p', 'mm', 'a4');
                    const content = document.getElementById('content');

                    await html2canvas(content, {
                        scale: 2,
                        useCORS: true
                    }).then(canvas => {
                        const imgData = canvas.toDataURL('image/png');
                        const imgWidth = 210;
                        const pageHeight = 297;
                        const imgHeight = (canvas.height * imgWidth) / canvas.width;
                        let position = 0;

                        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                        doc.save(`goods-receive-${state.number || 'unknown'}.pdf`);
                    });
                } catch (error) {
                    console.error('Error generating PDF:', error);
                } finally {
                    state.isDownloading = false;
                }
            },
        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['GoodsReceives']);
                var urlParams = new URLSearchParams(window.location.search);
                var id = urlParams.get('id');
                await methods.populatePDFData(id ?? '');
            } catch (e) {
                console.error('page init error:', e);
            } finally {
                
            }
        });

        return {
            state,
            handler,
        };
    }
};

Vue.createApp(App).mount('#app');