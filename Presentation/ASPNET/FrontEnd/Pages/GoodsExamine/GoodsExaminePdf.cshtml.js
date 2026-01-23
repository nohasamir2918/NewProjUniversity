const getArabicDayName = (date) => {
    const days = [
        'الأحد',
        'الاثنين',
        'الثلاثاء',
        'الأربعاء',
        'الخميس',
        'الجمعة',
        'السبت'
    ];
    return days[date.getDay()];
};
const toArabicNumber = (value) => {
    if (!value) return '';
    return value.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
};

const App = {
    setup() {

        const state = Vue.reactive({
            number: '',
            commiteeDayName: '',   // ✅ جديد
            commiteeDate: '',
            examineDayName: '',     // ✅ اليوم
            examineDate: '',        // ✅ تاريخ الفحص
            committeeDesionNumber: '',
            // 🟢 بيانات أمر التوريد
            purchaseOrderNumber: '',
            purchaseOrderDate: '',
            vendorName: '',
            committeeList: [],
            mappedItems: []
        });

        const services = {
            getPDFData: async (id) => {
                const res = await AxiosManager.get(
                    '/GoodsExamine/GetGoodsExamineSingle?id=' + id
                );

                console.log('API RESPONSE 👉', res);

                // ✅ المسار الصح
                return res.data.content;
            }
        };

        const methods = {
            loadData: async (id) => {
                const result = await services.getPDFData(id);

                const header = result.data;
                state.purchaseOrderNumber = header.purchaseOrderNumber ?? '';
                state.vendorName = header.vendorName ?? '';

                if (header.purchaseOrderDate) {
                    state.purchaseOrderDate = new Date(header.purchaseOrderDate)
                        .toLocaleDateString('ar-EG');
                } else {
                    state.purchaseOrderDate = '';
                }

                // ❗ ده الصح
                const transactions = result.purchaseOrder;


                state.number = header.number ?? '';
                if (header.commiteeDate) {
                    const d = new Date(header.commiteeDate);

                    state.commiteeDayName = getArabicDayName(d); // ✅ اليوم
                    state.commiteeDate = d.toLocaleDateString('ar-EG', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                } else {
                    state.commiteeDayName = '';
                    state.commiteeDate = '';
                }

                //state.commiteeDate = header.commiteeDate
                //    ? new Date(header.commiteeDate).toLocaleDateString('ar-EG')
                //    : '';
                if (header.examineDate) {
                    const d = new Date(header.examineDate);

                    state.examineDayName = getArabicDayName(d);

                    const day = toArabicNumber(d.getDate());
                    const month = toArabicNumber(d.getMonth() + 1);
                    const year = toArabicNumber(d.getFullYear());

                    state.examineDate = `${day} / ${month} / ${year}`;
                } else {
                    state.examineDayName = '';
                    state.examineDate = '';
                }

                state.committeeDesionNumber =
                    header.committeeDesionNumber ?? '';

                state.committeeList =
                    header.committeeList ?? [];

                state.mappedItems = (transactions ?? []).map(x => ({
                    product: `${x.product?.number ?? ''} - ${x.product?.name ?? ''}`,
                    qty: x.quantity ?? '',
                    description: x.summary ?? '',
                    unit: 'عدد',
                    matchPercent: x.percentage ?? '',
                    accepted: x.itemStatus === true,
                    rejected: x.itemStatus === false,
                    reason: x.reasons ?? ''
                }));

                console.log("daat", state.mappedItems)
            }
        };
        // ✅ رئيس اللجنة
        const chairman = Vue.computed(() =>
            state.committeeList.find(x => x.employeeType === true)
        );

        // ✅ أعضاء اللجنة
        const members = Vue.computed(() =>
            state.committeeList.filter(x => x.employeeType === false)
        );
        const handler = {
            downloadPDF: async () => {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');

                const pages = document.querySelectorAll('.print-area');

                for (let i = 0; i < pages.length; i++) {
                    const canvas = await html2canvas(pages[i], { scale: 2 });
                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = 210;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    if (i > 0) doc.addPage();
                    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                }

                doc.save(`goods-examine-${state.number}.pdf`);
            }
        };

        Vue.onMounted(async () => {
            const id = new URLSearchParams(window.location.search).get('id');
            if (id) {
                await methods.loadData(id);
            }
        });

        // مهم جدًا
        return {
            state,
            chairman,
            members,
            handler
        };
    }
};

Vue.createApp(App).mount('#app');
