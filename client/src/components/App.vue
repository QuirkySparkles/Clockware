<template>
    <div id="mainForm">
        <form>
            <label>Имя</label><br>
            <input type="text" minlength="3" v-model.lazy.trim="name" class="mainform" required><br><br>
            <label>Email</label><br>
            <input type="email" v-model.lazy.trim="email" class="mainform" required><br><br>
            <label>Размер часов</label><br>
            <input type="radio" value="small" v-model="clocksize" />
            <label>Маленькие</label><br>
            <input type="radio" value="medium" v-model="clocksize" />
            <label>Средние</label><br>
            <input type="radio" value="large" v-model="clocksize" />
            <label>Большие</label><br><br>
            <label>Город</label><br>
            <select v-model="city">
                <option v-for="city in cities">{{city}}</option>          
            </select><br><br>
            <label>Выберите удобную дату и время</label><br>
            <input type="date" v-model="orderDate" required>
            <select v-model="orderTime">
                <option v-for="time in times">{{time}}:00</option>          
            </select><br>
        </form>
        <button v-on:click="checkAvailability">Проверить наличие мастеров</button>
        <div>
            <p v-if="list[0]">Выберите мастера из списка:</p>
            <masterlist v-bind:list="list"
                        v-bind:chooseidfn="chooseId"></masterlist>
        </div>
        <p v-if="!list[0] && visible">К сожалению, на данное время нет свободных мастеров.</p>
        <button v-if="masterId"
                v-on:click="sendData"
                v-bind:disabled="disabled">Оформить заказ</button>
    </div>
</template>

<script>
    import axios from 'axios';
    import masterlist from "./masterlist.vue";
    
    function InputError(property) {
        Error.call(this, property);
        this.name = "InputError";
        this.property = property;
        this.message = "Ошибка при заполнении формы";
        this.stack = (new Error()).stack;
    }
    InputError.prototype = Object.create(Error.prototype);
    
    var instance = axios.create({
        baseURL: 'http://localhost:8081'
    });
    
    export default {
        name: "app",
        data: function() {
            return {
                name: '',
                email: '',
                clocksize: 'small',
                cities: ['Днепр', 'Ужгород'],
                city: 'Днепр',
                orderDate: '',
                times: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
                orderTime: '10:00',
                masterId: '',
                list: [],
                visible: false,
                disabled: false
            }
        },
        
        components: {
            masterlist
        },
        
        methods: {
            checkName: function() {
                var template = /^[A-Za-zА-Яа-я]+$/;
                if(this.name.length < 3 || !this.name.match(template)) {
                    throw new InputError('name');
                    return false;
                }
                return true;
            },
            
            checkDate: function() {
                var today = new Date();
                if((this.orderDate.slice(0, 4) - today.getFullYear()) > 1) {
                    throw new InputError('date');
                    return false;
                }
                var userDate =
                    Date.parse(`${this.orderDate}T${this.orderTime}:00.000+03:00`);
                if(userDate - Date.now() < 0 || this.orderDate.length == 0) {
                    throw new InputError('date');
                    return false;
                }
                return true;
            },
            
            checkEmail: function() {
                var template = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/;
                if(this.email.length < 7 || !this.email.match(template) ) {
                    throw new InputError('email');
                    return false;
                }
                return true;
            },
            
            checkAvailability: function() {
                try {
                    if(this.checkDate()) {
                        var requiredData = {
                            clocksize: this.clocksize,
                            city: this.city,
                            orderDate: this.orderDate,
                            orderTime: this.orderTime
                        }
                        instance.post("/check", requiredData)
                            .then(response => {
                                if(response.data[0]) {
                                    this.list = response.data;
                                    this.visible = false;
                                }
                                else this.visible = true;
                            })
                            .catch( function(error) {
                                console.log(error);
                            });
                        }
                    }
                catch(err) {
                    if(err.property == "date")
                        alert(err.message + ": Дата/Время.");
                    else 
                        alert('A global error occured:' + err.property + ' ' + err.stack);
                }
            },
            
            chooseId: function(value) {
                this.masterId = value;
            },
            
            sendData: function() {
                try {
                    if(this.checkName() && this.checkEmail() && this.checkDate()) {
                        
                        var client = {
                            name: this.name,
                            email: this.email,
                            clocksize: this.clocksize,
                            city: this.city,
                            orderDate: this.orderDate,
                            orderTime: this.orderTime,
                            masterId: this.masterId
                        }
                        this.disabled = true;
                        instance.post("/register", client)
                            .then(response => {
                                if(response.data == 'ok')
                                    alert('Ваш заказ был успешно оформлен!')
                            })
                            .catch( function(error) {
                                this.disabled = false;
                                console.log(error);
                            });
                        }
                    }
                catch(err) {
                    if(err.property == "name")
                        alert(err.message + ": Имя.");
                    else if(err.property == "date")
                        alert(err.message + ": Дата/Время.");
                    else if(err.property == "email")
                        alert(err.message + ": Email.");
                    else 
                        alert('A global error occured:' + err.property + ' ' + err.stack);
                }
            }
        }
    }
</script>

<style>
    label {
        font-family: sans-serif;
        font-weight: bold;
    }
</style>
