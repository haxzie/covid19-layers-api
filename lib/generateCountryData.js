const { getIndiaData } = require("./indiaDataApi");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

function readData({ filename }) {
  const file = fs
    .readFileSync(path.resolve(__dirname, "../data", filename))
    .toString();
  const JSONData = JSON.parse(file);
  return JSONData;
}

function writeData({ filename, data }) {
  fs.writeFileSync(
    path.resolve(__dirname, "../data", filename),
    JSON.stringify(data, null, 2)
  );
}

async function scrapeDataForInidia() {
  try {
    const response = await axios.get("https://www.mohfw.gov.in/");
    const { status, data } = response;
    if (!(status === 200 && data)) throw new Error("Invalid response");
    const $ = cheerio.load(data);
    const table = $(".table-responsive").find("tbody");
    let rows = [];
    $("tr", table).map((i, el) => {
      const cols = [];
      $("td", el).map((i, el) => {
        cols.push($(el).text());
      });
      const [
        id,
        state,
        confirmed_in,
        confirmed_non_in,
        recovered,
        deaths
      ] = cols;
      rows.push({
        state,
        confirmed: parseFloat(confirmed_in) + parseFloat(confirmed_non_in),
        recovered: parseFloat(recovered),
        deaths: parseFloat(deaths)
      });
    });

    let stateData = {};
    rows.slice(0, rows.length - 1).forEach(item => {
      Object.assign(stateData, {
        [item.state]: {
          ...item
        }
      });
    });
    // const stateData = rows.reduce((result, item) => {
    //   return Object.assign(result, {
    //     [item.state]: {
    //       ...item
    //     }
    //   });
    // }, {});
    return { stateData };
  } catch (error) {
    console.error(error);
  }
}

async function generateIndiaData() {
  try {
    const data = await scrapeDataForInidia();
    if (data) {
      const { stateData, countryData } = data;
      writeData({ filename: "states-data.json", data: stateData });
      const indianStates = readData({ filename: "india-states.geo.json" });
      const statesCases = [];
      const notPresent = [];
      Object.keys(stateData).forEach(state_name => {
        const stateStats = stateData[state_name];
        const stateMeta = indianStates.find(item =>
          state_name.includes(item.province)
        );
        if (stateMeta) {
          statesCases.push({
            ...stateMeta,
            location: stateMeta.location.reverse(),
            data: {
              confirmed: parseFloat(stateStats["confirmed"]),
              deaths: parseFloat(stateStats["deaths"]),
              recovered: parseFloat(stateStats["recovered"])
            }
          });
        } else {
          notPresent.push(state_name);
        }
      });
      console.log({ statesCases })
      return statesCases;
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = { generateIndiaData };
