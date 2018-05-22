<template>
    <div>
        <h1 v-if="isAuthorized">Admin Page!</h1>
        <p v-if="isAuthorized">Выберите раздел с которым хотите поработать:</p>
        <button v-if="isAuthorized"
                v-on:click="logout"
                class="logout">Выход</button>
        <ul v-if="isAuthorized">
            <li><router-link to="/admin/clients">Клиенты</router-link></li>
            <li><router-link to="/admin/masters">Мастера</router-link></li>
            <li><router-link to="/admin/cities">Города</router-link></li>
            <li><router-link to="/admin/reservations">Бронирования</router-link></li>
        </ul>
        <router-view v-if="isAuthorized"></router-view>
        <p v-if="!isAuthorized">Вам необходимо войти в систему перед тем как просматривать эту страницу.</p>
    </div>
</template>

<script>
    import axios from 'axios';
    
    var connection = axios.create({
        baseURL: 'http://localhost:8081'
    });
    
    export default {
        name: "admin",
        data: function () {
            return {
                isAuthorized: false
            }
        },
        
        methods: {
            checkAuth: function () {
                var token = document.cookie;
                connection({
                    method: 'get',
                    url: "/admin",
                    headers: function() {
                        if(!token) return {};
                        return { Authorization: token };
                    }()
                })
                .then( response => this.isAuthorized = true )
                .catch( err => {
                    console.log(err);
                    this.isAuthorized = false;
                    setTimeout( () => this.$router.push("/"), 2000);
                });
            },
            logout: function() {
                document.cookie = "access_token" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                setTimeout( () => this.$router.push("/"), 1000);
            }
        },
        mounted () {
            this.checkAuth();
        }
    }
</script>

<style>
    li {
        display: inline-block;
    }
    a {
        padding: 5px;
    }
    a.router-link-active, li.router-link-active > a {
        color: red;
    }
    .logout {
        position: absolute;
        top: 25px;
        left: 500px;
    }
</style>
