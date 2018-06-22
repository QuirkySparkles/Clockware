import api from "../../services/api.js";
var connection = api();

var checkAuth = {
    data: function() {
        return {
            isAuthorized: false
        }
    },
    
    methods: {
        findCookie: function(cookie, toFind) {
            var pos = cookie.indexOf(toFind) + toFind.length + 1;
            var endPos = cookie.indexOf(';', pos);
            if(pos == -1) return '';
            if (endPos != -1) return cookie.slice(pos, endPos);
            else return cookie.slice(pos);
        },
        
        checkAuth: function () {
            var token = this.findCookie(document.cookie, 'access_token');
            if(!token) {
                this.isAuthorized = false;
                if(this.$route.path != "/")
                    this.$router.go(this.$router.push("/"));
                return;
            }
            connection({
                method: 'get',
                url: "/admin",
                headers: function() {
                    return { Authorization: 'Bearer ' + token };
                }()
            })
            .then( response => this.isAuthorized = true )
            .catch( err => {
                this.isAuthorized = false;
                document.cookie = "access_token" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                if(this.$route.path != "/")
                    this.$router.go(this.$router.push("/"));
            });
        }
    }
};

export default checkAuth;