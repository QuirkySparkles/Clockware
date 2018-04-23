import Vue from 'vue'
import App from './components/App.vue'

new Vue({
    el: '#app',
    data: {
        user: {
            name: 'Tom',
            email: ''
        }
    },
//    router: router,
    render: h => h(App)
})