<template>
    <div>
        <h1>Управление клиентами</h1>
        <p v-show="!serverReply">Не могу отобразить список клиентов.</p>
        <p v-show="isEmpty && serverReply">Таблица пуста.</p>
        <div class="f-table" v-show="!isEmpty">
            <div class="f-tr" v-show="!isEmpty && serverReply">
                <div class="f-td">№</div>
                <div class="f-td">Имя клиента</div>
                <div class="f-td">Email</div>
                <div class="f-td">Размер часов</div>
                <div class="f-td">Город</div>
                <div class="f-td">Дата первого заказа</div>
            </div>
            <div class="f-tr" v-for="instance in clientlist">
                <div class="f-td">{{instance.number}}.</div>
                <div class="f-td">{{instance.name}}</div>
                <div class="f-td">{{instance.email}}</div>
                <div class="f-td">{{instance.clocksize}}</div>
                <div class="f-td">{{instance.city}}</div>
                <div class="f-td">{{instance.order_date}}</div>
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
            <label>Имя:</label>
            <input type="text" v-model.lazy.trim="toEdit.name" required>
            <br><br>
            <label>Email:</label>
            <input type="text" v-model.lazy.trim="toEdit.email" required>
            <br><br>
            <label>Размер часов:</label>
            <select v-model="toEdit.clocksize">
                <option v-for="size in clocksize">{{size}}</option>          
            </select>
            <br><br>
            <label>Город:</label>
            <input type="text" v-model.lazy.trim="toEdit.city" required>
            <br><br>
            <label>Дата:</label>
            <input v-model.lazy.trim="toEdit.order_date" required>
            <br><br>
            <button v-on:click="isVisible=!isVisible,
                                isDisabled=false">Отмена</button>
            <button v-on:click="acceptChanges">Внести изменения</button>
        </div>
        <button class="delbutton"
                v-show="toDelete[0]"
                v-on:click="deleteClient">Удалить выбранные записи</button>
    </div>
</template>

<script>
    import axios from 'axios';
    
    var connection = axios.create({
        baseURL: 'http://localhost:8081'
    });
    
    export default {
        name: "clients",
        data: function() {
            return {
                clientlist: [],
                toDelete: [],
                number: 0,
                clocksize: ["маленькие", "средние", "большие"],
                toEdit: {
                    number: 0,
                    name: "",
                    email: "",
                    clocksize: "",
                    city: "",
                    order_date: ""
                },
                serverReply: false,
                isEmpty: false,
                isVisible: false,
                isDisabled: false
            }
        },
        
        methods: {
            loadData: function() {
                connection.post("/admin/loaddata", {table: "clients"})
                .then( response => {
                    this.serverReply = true;
                    if(!response.data[0]) {
                        this.isEmpty = true;
                        this.clientlist = [];
                    }
                    else {
                        this.clientlist = response.data;
                        this.clientlist.forEach( item => {
                            if(item.clocksize == 's')
                                item.clocksize = "маленькие";
                            else if(item.clocksize == 'm')
                                item.clocksize = "средние";
                            else item.clocksize = "большие";
                            item.order_date = item.order_date.slice(0, 10);
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
                connection.post("/admin/clients", this.toEdit)
                .then( response => {
                    alert("Запись была обновлена.");
                    this.loadData();
                })
                .catch( error => {
                    console.log(error);
                    alert(error.message);
                });
            },
            
            deleteClient: function() {
                connection.post("/admin/deldata", { table: "clients", value: this.toDelete })
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
                for (var key in this.clientlist[this.number - 1]) {
                    this.toEdit[key] = this.clientlist[this.number - 1][key];
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
        right: 220px;
        width: 240px;
        border: 3px solid aqua;
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
    .delbutton {
        position: fixed;
        top: 220px;
        right: 383px;
    }
</style>