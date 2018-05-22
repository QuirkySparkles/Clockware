<template>
    <div>
        <h1>Управление городами</h1>
        <div class="stripe"></div>
        <p v-show="!serverReply">Не могу отобразить список городов.</p>
        <p v-show="isEmpty && serverReply">Таблица пуста.</p>
        <div class="f-table" v-show="!isEmpty">
            <div class="f-tr" v-show="!isEmpty && serverReply">
                <div class="f-td">№</div>
                <div class="f-td">Название</div>
            </div>
            <div class="f-tr" v-for="instance in citylist"
                 v-show="!isEmpty">
                <div class="f-td">{{instance.number}}.</div>
                <div class="f-td">{{instance.city}} </div>
                <div class="f-tde">
                    <input class="delbox" type="checkbox" 
                    v-bind:value="instance.number" 
                    v-model="toDelete">
                </div>
            </div>
        </div>
        <div class="addblock">
            <button v-show="serverReply"
                    v-on:click="visible = !visible">Добавить город</button>
            <input class="cityinput" type=text placeholder="Введите название города" 
                       v-model.trim="newCity"
                       v-show=visible>
            <button v-show=visible
                    v-on:click="addCity">Добавить</button>
        </div>
        <button class="delbutton" v-show="toDelete[0]"
                v-on:click="deleteCity">Удалить выбранные города</button>
    </div>
</template>

<script>
    import axios from 'axios';
    
    var connection = axios.create({
        baseURL: 'http://localhost:8081'
    });
    export default {
        name: "cities",
        data: function() {
            return {
                citylist: [],
                newCity: "",
                toDelete: [],
                serverReply: false,
                isEmpty: true,
                visible: false
            }
        },
        
        methods: {
            loadData: function() {
                connection.post("/admin/loaddata", {table: "cities"})
                .then( response => {
                    this.serverReply = true;
                    if(!response.data[0]) {
                        this.isEmpty = true;
                        this.citylist = [];
                    }
                    else {
                        this.citylist = response.data;
                        this.isEmpty = false;
                    }
                })
                .catch( error => { 
                    console.log(error);
                    alert(error.message);
                    this.serverReply = false;
                })
            },
            
            addCity: function() {
                if(!this.newCity) {
                    alert("Вы не ввели имя города");
                    return;
                }
                connection.post("/admin/cities", {number: this.citylist.length + 1, value: this.newCity} )
                .then( response => {
                    alert("Новый город добавлен");
                    this.newCity = "";
                    this.loadData();
                })
                .catch( error => console.log(error) )
            },
            
            deleteCity: function() {
                connection.post("/admin/deldata", { table: "cities", value: this.toDelete })
                .then( response => {
                    alert("Выбранные города были удалены");
                    this.toDelete = [];
                    this.loadData();
                })
                .catch( error => {
                    console.log(error);
                    alert(error.message);
                });
            }
        },
        mounted () {
            this.loadData();
        }
    }
</script>

<style>
    .stripe {
        height: 5px;
    }
    .f-table {
        display: table;
        border-collapse: collapse;
        width: 150px;
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
    .addblock {
        position: fixed;
        top: 200px;
    }
    .cityinput {
        margin: 0 10px;
    }
    .delbox {
        position: static;
        margin-top: 5px;
    }
    .delbutton {
        position: fixed;
        top: 220px;
        left: 170px;
    }
</style>