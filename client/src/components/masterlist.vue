<template>
    <div id="maslist">
        <div class="f-table" v-if="maslist[0]">
            <div class="f-tr">
                <div class=f-tdr>Мастер</div>
                <div class=f-td>Город</div>
                <div class=f-tdr>Рейтинг</div>
            </div>
            <div class ="f-tr" v-for="master in maslist" v-bind:key="master.id">
                <div class=f-td>{{master.name}} {{master.surname}}</div>
                <div class=f-td>{{master.city}}</div>
                <div class=f-tdr>{{master.rating}}</div>
                <div class=f-tde>
                    <input type="radio"
                        v-bind:value="master.id"
                        v-model="chosenmaster"
                        v-on:click="chosenmaster=master.id, chooseidfn(chosenmaster)"
                        v-bind:checked="master.id==chosenmaster">
                </div>    
            </div>
        </div>
    </div>
</template>

<script>    
    export default {
        name: "masterlist",
        props: ['maslist', 'chooseidfn'],
        data: function () {
            return { chosenmaster: ''};
        }
    }
</script>

<style>
    .f-table {
        display: table;
        border-collapse: collapse;
        width: 330px;
        position: relative;
        bottom: 15px;
    }
    .f-tr {
        display: table-row;
        border-bottom: 2px solid black;
    }
    .f-td {
        display: table-cell;
        text-align: left;
        border: none;
        vertical-align: middle;
        padding-top: 10px;
        padding-bottom: 10px;
    }
    .f-tdr {
        display: table-cell;
        text-align: center;
        border: none;
        vertical-align: middle;
        padding-top: 10px;
        padding-bottom: 10px;
    }
    .f-tde {
        display: table-cell;
        border-bottom: 2px solid white;
        padding-top: 8px;
        padding-bottom: 10px;
    }
</style>
