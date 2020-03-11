const axios = require("axios");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

async function fetchRemoteFile({ case, url, filename }) {
  const response = await axios.get(url);
  const { status, data } = response;
  if (status === 200) {
    const filePath = path.resolve(__dirname, `../data/files/${filename}`);
    const jsonData = [];
    fs.writeFileSync(filePath, data);
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", data => {
        const state = data["Province/State"];
        const country = data["Country/Region"];
        const latitude = data["Lat"];
        const longitude = data["longitude"];
        const regionType = state ? "state" : "country";
        const case
      })
      .on("end", () => {
        // transform the data
      });
  }
}

module.exports = fetchRemoteFile;
