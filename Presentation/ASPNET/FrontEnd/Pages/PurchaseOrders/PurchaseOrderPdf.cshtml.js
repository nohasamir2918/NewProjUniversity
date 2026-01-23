/* =========================
   Arabic Number To Words
========================= */
function numberToArabicWordsWithPiasters(amount) {

    const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
    const tens = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
    const teens = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
    const hundreds = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];

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

    if (!amount) return "صفر جنيه مصري";

    let parts = amount.toString().split('.');
    let pounds = parseInt(parts[0]);
    let piasters = parts[1] ? parseInt(parts[1].substring(0, 2)) : 0;

    let words = "";

    // الجنيهات
    if (pounds > 0) {
        if (pounds < 1000) {
            words = convert(pounds);
        } else {
            let thousands = Math.floor(pounds / 1000);
            let remainder = pounds % 1000;
            words = convert(thousands) + " ألف";
            if (remainder > 0) {
                words += " و " + convert(remainder);
            }
        }
        words += " جنيهًا مصريًا";
    }

    // القروش
    if (piasters > 0) {
        words += " و " + convert(piasters) + " قرشًا";
    }

    return words;
}
function toArabicNumber(value) {
    if (value === null || value === undefined) return '';

    return value.toString().replace(/\d/g, function (d) {
        return '٠١٢٣٤٥٦٧٨٩'[d];
    });
}

/* =========================
   Vue App
========================= */
const App = {
    setup() {
        const hasTax = Vue.computed(() => {
            if (!state.tax) return false;

            const numericTax = parseFloat(
                state.tax.toString().replace(/,/g, '')
            );

            return numericTax > 0;
        });

        const state = Vue.reactive({
            company: {
                name: '',
                description: '',
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
            orderNumber: '',
            orderDate: '',
            orderCurrency: '',
            subTotal: '',
            tax: '',
            totalAmount: '',
            description: '',
            items: [],
            isDownloading: false
        });

        /* =========================
           Services
        ========================= */
        const services = {
            getPDFData: async (id) => {
                const response = await AxiosManager.get(
                    '/PurchaseOrder/GetPurchaseOrderSingle?id=' + id, {}
                );
                return response;
            }
        };

        /* =========================
           Methods
        ========================= */
        const methods = {

            populatePDFData: async (id) => {
                const response = await services.getPDFData(id);
                const pdfData = response?.data?.content?.data || {};

                state.description = pdfData.description || '';
                state.items = pdfData.purchaseOrderItemList || [];
                state.vendor = pdfData.vendor || {};
                state.orderNumber = pdfData.number || '';
                state.orderDate = DateFormatManager.formatToLocale(pdfData.orderDate) || '';
                state.orderCurrency = StorageManager.getCompany()?.currency || '';

                state.subTotal = NumberFormatManager.formatToLocale(pdfData.beforeTaxAmount) || '';
                state.tax = NumberFormatManager.formatToLocale(pdfData.taxAmount) || '';
                state.totalAmount = NumberFormatManager.formatToLocale(pdfData.afterTaxAmount) || '';

                methods.bindPDFControls();
            },

            bindPDFControls: () => {
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

                state.companyAddress = [
                    company.street,
                    company.city,
                    company.state,
                    company.zipCode,
                    company.country
                ].filter(Boolean).join(', ');

                state.vendorAddress = [
                    state.vendor.street,
                    state.vendor.city,
                    state.vendor.state,
                    state.vendor.zipCode,
                    state.vendor.country
                ].filter(Boolean).join(', ');
            }
        };

        /* =========================
           Computed (تفقيط المبلغ)
        ========================= */
        const totalAmountInWords = Vue.computed(() => {
            if (!state.totalAmount) return '';

            const numericValue = state.totalAmount
                .toString()
                .replace(/,/g, '');

            return numberToArabicWordsWithPiasters(numericValue);
        });

        /* =========================
           Handlers
        ========================= */
        const handler = {
            downloadPDF: async () => {
                state.isDownloading = true;
                await new Promise(r => setTimeout(r, 500));

                try {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF('p', 'mm', 'a4');
                    const content = document.getElementById('content');

                    const canvas = await html2canvas(content, {
                        scale: 2,
                        useCORS: true
                    });

                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = 210;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                    doc.save(`purchase-order-${state.orderNumber || 'unknown'}.pdf`);

                } catch (error) {
                    console.error('PDF Error:', error);
                } finally {
                    state.isDownloading = false;
                }
            }
        };

        /* =========================
           Mounted
        ========================= */
        Vue.onMounted(async () => {
            await SecurityManager.authorizePage(['PurchaseOrders']);
            const id = new URLSearchParams(window.location.search).get('id');
            await methods.populatePDFData(id ?? '');
        });

        return {
            state,
            handler,
            totalAmountInWords,
            toArabicNumber,
            hasTax
        };
    }
};

Vue.createApp(App).mount('#app');
