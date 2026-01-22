const App = {
    setup() {
        const state = Vue.reactive({
            email: '',
            password: '',
            isSubmitting: false,
            errors: {
                email: '',
                password: ''
            }
        });

        const validateForm = () => {
            state.errors.email = '';
            state.errors.password = '';
            let isValid = true;

            if (!state.email) {
                state.errors.email = 'البريد الإلكتروني مطلوب.';
                isValid = false;
            } else if (!/\S+@\S+\.\S+/.test(state.email)) {
                state.errors.email = 'من فضلك أدخل بريدًا إلكترونيًا صحيحًا.';
                isValid = false;
            }

            if (!state.password) {
                state.errors.password = 'كلمة المرور مطلوبة.';
                isValid = false;
            } else if (state.password.length < 6) {
                state.errors.password = 'كلمة المرور يجب ألا تقل عن 6 أحرف.';
                isValid = false;
            }

            return isValid;
        };

        const handleSubmit = async () => {

            try {
                state.isSubmitting = true;
                await new Promise(resolve => setTimeout(resolve, 300));

                if (!validateForm()) {
                    return;
                }

                const response = await AxiosManager.post('/Security/Login', {
                    email: state.email,
                    password: state.password
                });

                if (response.data.code === 200) {
                    StorageManager.saveLoginResult(response.data);
                    Swal.fire({
                        icon: 'success',
                        title: 'تم تسجيل الدخول بنجاح',
                        text: 'جاري تحويلك الآن...',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    setTimeout(() => {
                        window.location.href = '/Dashboards/DefaultDashboard';
                    }, 2000);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'فشل تسجيل الدخول',
                        text: response.data.message || 'من فضلك تحقق من بيانات الدخول.',
                        confirmButtonText: 'حاول مرة أخرى'
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'حدث خطأ',
                    text: error.response?.data?.message || 'من فضلك حاول مرة أخرى.',
                    confirmButtonText: 'موافق'
                });
            } finally {
                state.isSubmitting = false;
            }
        };

        return {
            state,
            handleSubmit
        };
    }
};

Vue.createApp(App).mount('#app');
