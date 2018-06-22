module.exports = {
    state: "00000000000000",
    generate: function() {
        this.state = "";
        var num = Math.random();
        return this.state += Math.round ( num * Math.pow(10, (10 + num * 10 ^ 0) ) );
    }
}