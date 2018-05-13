import Vue from 'vue';
import App from './App.vue';
import routes from './routes';
import vueRouter from 'vue-router';

new Vue({
    el: '#app',
    router: routes,
    template: '<App/>',
    components: { App }
})
