import axios from 'axios';
var URL;

if(process.env.NODE_ENV == 'production') URL = 'https://clockserver.herokuapp.com';
else URL = 'http://localhost:8081'

export default () => {
    return axios.create({
        baseURL: URL
    })
}