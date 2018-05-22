<template>
    <div>
        <h1>Управление мастерами</h1>
        <p v-show="!serverReply">Не могу отобразить список мастеров.</p>
        <p v-show="isEmpty && serverReply">Таблица пуста.</p>
        <div class="test">
            <div class="table">
                <button class="addbutton"v-show="serverReply"
                    v-on:click="showForm=!showForm">Добавить мастера</button>
                <div class="f-table" v-show="!isEmpty">
                    <div class="f-tr" v-show="!isEmpty && serverReply">
                        <div class="f-td">ID мастера</div>
                        <div class="f-td">Имя</div>
                        <div class="f-td">Фамилия</div>
                        <div class="f-td">Город</div>
                        <div class="f-td">Рейтинг</div>
                    </div>
                    <div class="f-tr" v-for="instance in masterlist">
                        <div class="f-td">{{instance.id}}</div>
                        <div class="f-td">{{instance.name}}</div>
                        <div class="f-td">{{instance.surname}}</div>
                        <div class="f-td">{{instance.city}}</div>
                        <div class="f-td">{{instance.rating}}</div>
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
            </div>
            <div class="blockform">
                <div class="forms" v-show="showForm">
                    <p>Добавить нового мастера:</p>
                    <label>ID мастера:</label>
                    <input type="text" v-model.lazy.trim="toAdd.id" required>
                    <br><br>
                    <label>Имя:</label>
                    <input type="text" v-model.lazy.trim="toAdd.name" required>
                    <br><br>
                    <label>Фамилия:</label>
                    <input type="text" v-model.lazy.trim="toAdd.surname" required>
                    <br><br>
                    <label>Город:</label>
                    <input v-model.lazy.trim="toAdd.city" required>
                    <br><br>
                    <label>Рейтинг:</label>
                    <select v-model="toAdd.rating">
                        <option v-for="rating in ratings">{{rating}}</option>
                    </select>
                    <br><br>
                    <button v-on:click="showForm=!showForm">Отмена</button>
                    <button v-on:click="addMaster">Добавить</button>
                </div>
                <div class="forms" v-show="isVisible">
                    <p>Редактировать запись:</p>
                    <label>ID мастера:</label>
                    <input type="text" v-model.lazy.trim="toEdit.id" required>
                    <br><br>
                    <label>Имя:</label>
                    <input type="text" v-model.lazy.trim="toEdit.name" required>
                    <br><br>
                    <label>Фамилия:</label>
                    <input type="text" v-model.lazy.trim="toEdit.surname" required>
                    <br><br>
                    <label>Город:</label>
                    <input v-model.lazy.trim="toEdit.city" required>
                    <br><br>
                    <label>Рейтинг:</label>
                    <select v-model="toEdit.rating">
                        <option v-for="rating in ratings">{{rating}}</option>
                    </select>
                    <br><br>
                    <button v-on:click="isVisible=!isVisible,
                                        isDisabled=false">Отмена</button>
                    <button v-on:click="acceptChanges">Внести изменения</button>
                </div>
            </div>
        </div>
        <button class="delbutton"
                v-show="toDelete[0]"
                v-on:click="deleteMaster">Удалить выбранные записи</button>
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
                masterlist: [],
                toDelete: [],
                number: 0,
                ratings: [0, 1, 2, 3, 4, 5],
                toEdit: {
                    id: 0,
                    name: "",
                    surname: "",
                    city: "",
                    rating: ""
                },
                toAdd: {
                    number: 0,
                    id: "",
                    name: "",
                    surname: "",
                    city: "",
                    rating: ""
                },
                serverReply: false,
                isEmpty: false,
                isVisible: false,
                isDisabled: false,
                showForm: false
            }
        },
        
        methods: {
            loadData: function() {
                connection.post("/admin/loaddata", {table: "masters"} )
                .then( response => {
                    this.serverReply = true;
                    if(!response.data[0]) {
                        this.isEmpty = true;
                        this.masterlist = [];
                    }
                    else {
                        this.masterlist = response.data;
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
                connection.post("/admin/masters", this.toEdit)
                .then( response => {
                    alert("Запись была обновлена.");
                    this.loadData();
                })
                .catch( error => {
                    console.log(error);
                    alert(error.message);
                });
            },
            
            addMaster: function() {
                this.toAdd.number = this.masterlist.length + 1;
                for(var key in this.toAdd) {
                    if(!this.toAdd[key]) {
                        alert("Вы заполнили не все поля!");
                        return;
                    }
                }
                connection.post("/admin/addmaster", this.toAdd)
                .then( response => {
                    alert("Новый мастер добавлен");
                    for(var key in this.toAdd) {
                        this.toAdd[key] = "";
                    }
                    this.toAdd.number = 0;
                    this.loadData();
                })
                .catch( error => {
                    console.log(error);
                    alert(error.message);
                })
            },
            
            deleteMaster: function() {
                connection.post("/admin/deldata", { table: "masters", value: this.toDelete })
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
                for (var key in this.masterlist[this.number - 1]) {
                    this.toEdit[key] = this.masterlist[this.number - 1][key];
                }
            }
        },
        
        mounted () {
            this.loadData();
        }
    }
</script>

<style scoped>
    .table {
        display: inline-block;
    }
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
    .addbutton {
        position: relative;
        bottom: 10px;
    }
    .blockform {
        display: inline-block;
        position: absolute;
        top: 250px;
        right: 160px;
    }
    .forms {
        width: 275px;
        background-color: white;
        border: 3px solid violet;
        display: block;
        padding: 10px;
        padding-left: 15px;
        padding-top: 0;
    }
    input {
        position: absolute;
        right: 24px;
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