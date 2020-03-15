const axios = require('axios');

const client = axios.create({
    baseURL: `https://exec.clay.run/kunksed/mohfw-covid`
});

const getIndiaData = () => {
    return client.get();
}

module.exports = { getIndiaData }