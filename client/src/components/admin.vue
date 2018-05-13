<template>
    <div>
        <h1 v-if="isAuthorized">Admin Page!</h1>
        <p v-if="!isAuthorized">Вам необходимо войти в систему перед тем как просматривать эту страницу.</p>
    </div>
</template>

<script>
    import axios from 'axios';
    import eventBus from './event-bus.js';
    
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
                });
            }
        },
        mounted () {
            this.checkAuth();
        }
    }
</script>