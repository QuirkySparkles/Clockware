<template>
    <div id="list">
        <div v-for="(master, index) in list" v-bind:key="master.id">
            <p>{{master.name}} {{master.surname}} {{master.city}} Рейтинг: {{master.rating}}</p>
            <input type="radio"
                   v-bind:value="master.id"
                   v-model="chosenmaster"
                   v-on:click="chosenmaster=master.id, chooseidfn(chosenmaster)"
                   v-bind:checked="master.id==chosenmaster">    
            <label>Выбрать</label>
        </div>
    </div>
</template>

<script>    
    export default {
        name: "masterlist",
        props: ['list', 'chooseidfn'],
        data: function () {
            return { chosenmaster: ''};
        }
    }
</script>