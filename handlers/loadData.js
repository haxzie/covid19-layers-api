const fetchRemoteFile = require("../lib/fetchRemoteFile");

async function loadCSVs({ filename }) {
  const data = await fetchRemoteFile({
    filename: `${filename}.csv`,
    url:
      `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-${filename}.csv`
  });
  return data;
}

module.exports = loadCSVs;
