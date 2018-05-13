<template>
    <div class="adminform" v-bind:class="{active: isActive}">
        <form action="/admin">
            <label>Логин:</label>
            <input class="adminlogin"
                   v-model.lazy.trim="login" required><br>
            <label>Пароль:</label>
            <input type="password"
                   v-model.lazy.trim="password" required><br>
            <button v-on:click="authorize">Войти</button>
        </form>
    </div>
</template>

<script>
    import axios from 'axios';
    import eventBus from './event-bus.js';

    var connection = axios.create({
        baseURL: 'http://localhost:8081'
    });
    
    export default {
        name: "adminform",
        data: function() {
            return {
                login: '',
                password: ''
            }
        },

        props: ['isActive'],
        
        methods: {
            authorize: function() {
                if(!this.login || !this.password) alert("Вы не ввели логин/пароль.");
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
                })
                .catch( function(error) {
                    console.log(error);
                    alert(error.message);
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

