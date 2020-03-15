const { getIndiaData } = require("./indiaDataApi");
const fs = require("fs");
const path = require("path");

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

async function generateIndiaData() {
  try {
    const response = await getIndiaData();
    const { status, data } = response;
    if (status === 200 && data) {
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
            data: {
              confirmed: parseFloat(stateStats["cases"]),
              deaths: parseFloat(stateStats["deaths"]),
              recovered: parseFloat(stateStats["cured_discharged"])
            }
          });
        } else {
            notPresent.push(state_name)
        }
      });
      return statesCases;
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = { generateIndiaData }