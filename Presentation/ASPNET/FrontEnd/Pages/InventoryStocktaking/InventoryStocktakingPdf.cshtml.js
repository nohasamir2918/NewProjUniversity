const app = Vue.createApp({
    data() {
        return {
            state: {
                company: "مديرية ....",
                date: "31/01/2026",
                items: [
                    {
                        product: "كرسي مكتب",
                        unit: "عدد",
                        bookBalance: 40,
                        actualBalance: 38,
                        difference: -2,
                        status: "عجز",
                        notes: "كسر"
                    }
                ]
            }
        };
    }
});

app.mount("#app");
