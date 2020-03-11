const fetchRemoteFile = require('../lib/fetchRemoteFile');

async function loadCSVs() {
    const data = await fetchRemoteFile({ filename: "confirmed.csv", url: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv"});
    console.log(data);
}

module.exports = loadCSVs;