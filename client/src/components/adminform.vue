<template>
    <div class="adminform" v-bind:class="{active: isActive}">
        <form id="admform">
            <label>Логин:</label>
            <input class="adminlogin"
                   v-model.lazy.trim="login" required><br>
            <label>Пароль:</label>
            <input type="password"
                   v-model.lazy.trim="password" required><br>
        </form>
        <button v-on:click="authorize">Войти</button>
    </div>
</template>

<script>
    import axios from 'axios';

    var connection = axios.create({
        baseURL: 'http://localhost:8081'
    });
    
    export default {
        name: "adminform",
        data: function() {
            return {
                login: "",
                password: ""
            }
        },

        props: ['isActive'],
        
        methods: {
            authorize: function() {
                if(!this.login || !this.password) {
                    alert("Вы не ввели логин/пароль.");
                    return;
                }
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
                    console.log('Authorizing');
                    this.$router.push("/admin");
                })
                .catch( error => {
                    console.log(error);
                    this.login = "";
                    this.password = "";
                    if(error.response) {
                        if(error.response.status === 400)
                            alert("Неверный логин или пароль.");
                        else alert("Произошла ошибка на сервере, попробуйте повторить запрос позже.");
                    }
                });
            }
        }
    }
    
</script>

<style>
    .adminform {
        visibility: hidden;
        position: absolute;
        left: +500px;
        top: +50px;
        width: 245px;
        height: 90px;
        padding: 10px 15px;
        background-color: cornflowerblue;
    }
    .adminform input {
        margin: 5px 0;
    }
    .adminform .adminlogin {
        margin-left: 13px;
    }
    .active {
        visibility: visible;
    }
</style>

