import Vue from 'vue';
import Router from 'vue-router';
import mainPage from '../components/mainpage.vue';
import admin from '../components/admin.vue';

Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'Main',
            component: mainPage
        },
    
        {
            path: '/admin',
            name: 'Admin',
            component: admin
        }
    
    ]
})
