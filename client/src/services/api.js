import axios from 'axios';

/*
var connection = axios.create({
        baseURL: 'http://localhost:8081'
    });
*/

export default () => {
    return axios.create({
        baseURL: 'http://localhost:8081'
    })
}

//export default connection;