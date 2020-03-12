const axios = require("axios");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

/**
 * 
 * @param {Object} param
 * @param {} 
 */
async function fetchRemoteFile({ url, filename }) {
  return new Promise(async (resolve, reject) => {

    // fethc the file 
    const response = await axios.get(url);
    const { status, data } = response;
    if (status === 200) {
      const filePath = path.resolve(__dirname, `../data/files/${filename}`);
      const jsonData = [];

      // write the raw file to cache
      fs.writeFileSync(filePath, data);
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", data => {
          const state = data["Province/State"];
          const country = data["Country/Region"];
          const latitude = data["Lat"];
          const longitude = data["Long"];
          const regionType = state ? "state" : "country";

          // process all the date columns
          const timeRegex = /^[0-9]?\/[0-9]+\/[0-9]+$/;
          const events = Object.keys(data)
            .filter(item => timeRegex.test(item))
            .map(dateHeader => {
              return {
                timestamp: new Date(dateHeader),
                value: data[dateHeader]
              };
            });
          const latest = events[events.length - 1].value;
          jsonData.push({
            state,
            country,
            latitude,
            longitude,
            regionType,
            events,
            latest
          });
        })
        .on("end", () => resolve(jsonData));
    }
  });
}

module.exports = fetchRemoteFile;
