<template>
    <div id="mainform">
        <div class="loginbutton" v-on:click="isActive=!isActive">
            <span class="log">login</span>
        </div>
        <div>
            <adminform v-bind:isActive="isActive"></adminform>
        </div>
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
        </form><br>
        <button v-on:click="checkAvailability">Проверить наличие мастеров</button>
        <div>
            <p v-if="maslist[0]">Выберите мастера из списка:</p>
            <masterlist v-bind:maslist="maslist"
                        v-bind:chooseidfn="chooseId"></masterlist>
        </div>
        <p v-if="!maslist[0] && visible">К сожалению, на данное время нет свободных мастеров.</p>
        <button v-if="masterId"
                v-on:click="sendData"
                v-bind:disabled="disabled">Оформить заказ</button>
    </div>
</template>

<script>
    import axios from 'axios';
    import masterlist from "./masterlist.vue";
    import adminform from "./adminform.vue";
    
    function InputError(property) {
        Error.call(this, property);
        this.name = "InputError";
        this.property = property;
        this.message = "Ошибка при заполнении формы";
        this.stack = (new Error()).stack;
    }
    InputError.prototype = Object.create(Error.prototype);
    
    var connection = axios.create({
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
                maslist: [],
                visible: false,
                disabled: false,
                isActive: false,
                authorized: false
            }
        },
        
        components: {
            masterlist,
            adminform
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
                        connection.post("/check", requiredData)
                            .then(response => {
                                if(response.data[0]) {
                                    this.maslist = response.data;
                                    this.visible = false;
                                }
                                else this.visible = true;
                            })
                            .catch( error => {
                                console.log(error);
                                alert("Ошибка при обращении к базе данных, попробуйте ещё раз позже.");
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
                        connection.post("/register", client)
                            .then(response => alert('Ваш заказ был успешно оформлен! На Вашу почту было отправлено письмо с деталями заказа.') )
                            .catch( error => {
                                this.disabled = false;
                                console.log(error);
                                if(error.response) {
                                    if(error.response.status == 400)
                                        alert("Вы ввели некорректный Email!");
                                    else(error.response.status == 500)
                                        alert("Ошибка при обращении к базе данных, попробуйте ещё раз позже.");
                                }
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
    .loginbutton {
        position: absolute;
        left: +500px;
        background-color: aqua;
        width: 70px;
        height: 25px;
        padding-top: 5px;
    }
    .loginbutton:active {
        background-color: blue;
    }
    .log {
        margin-left: 18px;
    }
</style>
