<template>
    <div>
        <h1>Управление списком бронирований</h1>
        <p v-show="!serverReply">Не могу отобразить список бронирований.</p>
        <p v-show="isEmpty && serverReply">Таблица пуста.</p>
        <div class="f-table" v-show="!isEmpty">
            <div class="f-tr" v-show="!isEmpty && serverReply">
                <div class="f-td">№</div>
                <div class="f-td">Email заказчика</div>
                <div class="f-td">Город</div>
                <div class="f-td">ID мастера</div>
                <div class="f-td">Размер часов</div>
                <div class="f-td">Дата заказа</div>
                <div class="f-td">Время</div>
            </div>
            <div class="f-tr" v-for="instance in orderlist">
                <div class="f-td">{{instance.number}}.</div>
                <div class="f-td">{{instance.client_email}}</div>
                <div class="f-td">{{instance.city}}</div>
                <div class="f-td">{{instance.master_id}}</div>
                <div class="f-td">{{instance.clocksize}}</div>
                <div class="f-td">{{instance.order_date}}</div>
                <div class="f-td">{{instance.order_time}}</div>
                <div class="f-tde">
                    <button class="chbutton" v-on:click="number=instance.number, editRecord()"
                    v-bind:disabled="isDisabled">Изменить запись</button>
                </div>
                <div class="f-tde">
                    <input class="delbox" type="checkbox" 
                            v-bind:value="instance.number" 
                            v-model="toDelete">
                </div>
            </div>
        </div>
        <div class="editform" v-show="isVisible">
            <p>Редактировать запись:</p>
            <label>Город:</label>
            <input type="text" v-model.lazy.trim="toEdit.city" required>
            <br><br>
            <label>Email заказчика:</label>
            <input type="text" v-model.lazy.trim="toEdit.client_email" required>
            <br><br>
            <label>ID мастера:</label>
            <input type="text" v-model.lazy.trim="toEdit.master_id" required>
            <br><br>
            <label>Размер часов:</label>
            <select v-model="toEdit.clocksize">
                <option v-for="size in clocksize">{{size}}</option>          
            </select>
            <br><br>
            <label>Дата заказа:</label>
            <input v-model.lazy.trim="toEdit.order_date" required>
            <br><br>
            <label>Время заказа:</label>
            <select v-model="toEdit.order_time">
                <option v-for="time in times">{{time}}:00</option>
            </select>
            <br><br>
            <button v-on:click="isVisible=!isVisible,
                                isDisabled=false">Отмена</button>
            <button v-on:click="acceptChanges">Внести изменения</button>
        </div>
        <button v-show="toDelete[0]"
                v-on:click="deleteOrder">Удалить выбранные записи</button>
    </div>
</template>

<script>
    import axios from 'axios';
    
    var connection = axios.create({
        baseURL: 'http://localhost:8081'
    });
    
    export default {
        name: "reservations",
        data: function() {
            return {
                orderlist: [],
                toDelete: [],
                number: 0,
                clocksize: ["маленькие", "средние", "большие"],
                times: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
                toEdit: {
                    number: 0,
                    client_email: "",
                    city: "",
                    master_id: "",
                    clocksize: "",
                    order_date: "",
                    order_time: ""
                },
                serverReply: false,
                isEmpty: false,
                isVisible: false,
                isDisabled: false
            }
        },
        
        methods: {
            loadData: function() {
                connection.post("/admin/loaddata", {table: "orders"})
                .then( response => {
                    this.serverReply = true;
                    if(!response.data[0]) {
                        this.isEmpty = true;
                        this.orderlist = [];
                    }
                    else {
                        this.orderlist = response.data;
                        this.orderlist.forEach( item => {
                            if(item.clocksize == 's')
                                item.clocksize = "маленькие";
                            else if(item.clocksize == 'm')
                                item.clocksize = "средние";
                            else item.clocksize = "большие";
                            item.order_date = item.order_date.slice(0, 10);
                            item.order_time = item.order_time.slice(0, 5);
                        });
                        this.isEmpty = false;
                    }
                })
                .catch( error => {
                    this.serverReply = false;
                    console.log(error);
                    alert(error.message);
                })
            },
            
            acceptChanges: function() {
                connection.post("/admin/orders", this.toEdit)
                .then( response => {
                    alert("Запись была обновлена.");
                    this.loadData();
                })
                .catch( error => {
                    console.log(error);
                    alert(error.message);
                });
            },
            
            deleteOrder: function() {
                connection.post("/admin/deldata", { table: "orders", value: this.toDelete })
                .then( response => {
                    alert("Выбранные записи были удалены");
                    this.toDelete = [];
                    this.loadData();
                })
                .catch( error => {
                    console.log(error);
                    alert(error.message);
                });
            },
            
            editRecord: function() {
                this.isVisible = !this.isVisible;
                this.isDisabled = true;
                for (var key in this.orderlist[this.number - 1]) {
                    this.toEdit[key] = this.orderlist[this.number - 1][key];
                }
            }
        },
        
        mounted () {
            this.loadData();
        }
    }
</script>

<style scoped>
    .f-table {
        position: relative;
        bottom: 15px;
        display: table;
        border-collapse: collapse;
        width: 700px;
    }
    .f-tr {
        display: table-row;
        border-bottom: 2px solid black;
    }
    .f-td {
        display: table-cell;
        text-align: center;
        border: none;
        vertical-align: middle;
        padding-top: 10px;
        padding-bottom: 10px;
    }
    .f-tde {
        display: table-cell;
        text-align: center;
        border-bottom: 2px solid white;
        padding-top: 8px;
        padding-bottom: 10px;
    }
    .editform {
        position: fixed;
        top: 250px;
        right: 200px;
        width: 275px;
        border: 3px solid aqua ;
        background-color: white;
        display: inline-block;
        padding: 10px;
        padding-left: 15px;
        padding-top: 0;
    }
    input {
        position: absolute;
        right: 26px;
    }
    .chbutton {
        margin-bottom: 5px;
    }
    .delbox {
        position: static;
        margin-top: 15px;
    }
</style>