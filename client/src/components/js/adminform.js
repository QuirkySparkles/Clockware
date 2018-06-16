import api from "../../services/api.js";

var connection = api();

export default {
    name: "adminform",
    data: function() {
        return {
            login: "",
            password: "",
            logWarning: false,
            isEmpty: false
        }
    },

    props: ['isActive'],

    methods: {
        authorize: function() {
            if(!this.login || !this.password) {
                this.isEmpty = true;
                this.logWarning = false;
                return;
            }
            this.isEmpty = false;
            connection({
                url: '/auth',
                method: 'post',
                data: {
                    login: this.login,
                    password: this.password
                },
                withCredentials: true
            })
            .then(response => {
                this.$router.go(this.$router.push("/admin"));
            })
            .catch( error => {
                this.login = "";
                this.password = "";
                if(error.response) {
                    if(error.response.status === 400)
                        this.logWarning = true;
                    else alert("Произошла ошибка на сервере, попробуйте повторить запрос позже.");
                }
            });
        }
    }
}