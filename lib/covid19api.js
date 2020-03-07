const axios = require("axios");

const client = axios.create({
    baseURL: `https://coronavirus-tracker-api.herokuapp.com`
});

/**
 * Fetch all data related to covid19
 */
const getAllData = () => {
    return client.get(`/all`)
}

/**
 * fetch only confirmed data
 */
const getConfirmed = () => {
    return client.get(`/confirmed`);
}

/**
 * fetch only deaths
 */
const getDeaths = () => {
    return client.get(`/deaths`);
}

const getRecovered = () => {
    return client.get(`/recovered`);
}

module.exports = {
    getAllData,
    getConfirmed,
    getDeaths,
    getRecovered
}