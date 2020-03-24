const createCountryIndexes = require("./createCountryIndexes");
const { getAllData } = require("./covid19api");
const fs = require("fs");
const path = require("path");
const Layer = require("../models/layer.model");
const crypto = require("crypto");
const fixCountryCodes = require("./fixCountryCodes");
const { generateIndiaData } = require("./generateCountryData");
const ora = require("ora");

/**
 * Writes json objects to the data directory
 * @param {Object} data
 * @param {String} data.filename Filename of the data
 * @param {Object} data.jsonObject JSON object to be written
 */
function writeData({ filename, jsonObject }) {
  try {
    fs.writeFileSync(
      path.resolve(__dirname, "../data", filename),
      JSON.stringify(jsonObject, null, 2)
    );
  } catch (error) {
    console.error(error);
    process.exit(-1);
  }
}

/**
 * Saves the layers object in the data
 * @param {Object} layerObject
 */
function createLayers(layerObject) {
  if (layerObject && Object.keys(layerObject).length > 0) {
    const data = Object.keys(layerObject).map(layerId => {
      return new Layer({ id: layerId, value: layerObject[layerId] });
    });

    writeData({ filename: "layers/layers.json", jsonObject: data });
  }
}

/**
 * Creates an indexed object out of an array of objects based on the keys provided
 * @param {Object} param
 * @param {Array} param.data Data to be indexed
 * @param {Array} param.keys Keys to be used as index
 */
async function createIndexes({ data, keys }) {
  const indexedData = data.reduce((result, item) => {
    // create a key string to be used to hash
    const hashKey = keys.map(key => item[key] || "").join("_");
    // create a hash for the key
    const hash = crypto
      .createHash("md5")
      .update(hashKey)
      .digest("hex")
      .toString();
    return Object.assign(result, {
      [hash]: {
        id: hash,
        ...item
      }
    });
  }, {});
  return indexedData;
}

/**
 * Generates scatterplot and geojson layers for the data
 */
async function generateLayerData() {
  let sp_countries = ora("Indexing country data...").start();
  const countries = createCountryIndexes();
  sp_countries.succeed();

  let sp_covid_data = ora("Fetching latest impact data...").start();
  const response = await getAllData();
  const { status, data } = response;

  if (status === 200 && data) {
    sp_covid_data.succeed();
    const { latest, confirmed, deaths, recovered } = data;
    console.log({ latest });
    // save the layers
    let sp_layers = ora("Generating layers...").start();
    createLayers({
      ...latest,
      exisiting: latest.confirmed - (latest.deaths + latest.recovered)
    });
    // join the data into single object
    sp_layers.text = "Indexing confirmed cases";
    const indexedConfirms = await createIndexes({
      data: fixCountryCodes(confirmed.locations),
      keys: ["country_code", "province"]
    });

    sp_layers.text = "Indexing death cases";
    const indexedDeaths = await createIndexes({
      data: fixCountryCodes(deaths.locations),
      keys: ["country_code", "province"]
    });

    sp_layers.text = "Indexing recovered cases";
    const indexedRecovered = await createIndexes({
      data: fixCountryCodes(recovered.locations),
      keys: ["country_code", "province"]
    });

    sp_layers.succeed();

    let sp_india = ora("Fethcing country data for India...").start();
    const indexedIndiaData = await createIndexes({
      data: await generateIndiaData(),
      keys: ["country_code", "province"]
    });
    sp_india.succeed();

    let sp_merging = ora("Merging layer data...").start();
    let layerData = await Object.keys(indexedConfirms).map(key => {
      const confirmData = indexedConfirms[key];
      return {
        id: key,
        location: [confirmData.coordinates.long, confirmData.coordinates.lat],
        country: confirmData.country,
        country_code: confirmData.country_code,
        province: confirmData.province,
        data: {
          confirmed: confirmData.latest,
          existing:
            confirmData.latest -
            ((indexedDeaths[key] ? indexedDeaths[key].latest : 0) +
              (indexedRecovered[key] ? indexedRecovered[key].latest : 0)),
          deaths: indexedDeaths[key] ? indexedDeaths[key].latest : 0,
          recovered: indexedRecovered[key] ? indexedRecovered[key].latest : 0
        }
      };
    });

    sp_merging.text = "Adding data for indian states...";
    // remove data related to india as a country
    layerData = layerData.filter(item => item.country !== "India");
    // update data with data from indian states
    layerData.push(
      ...Object.keys(indexedIndiaData).map(id => indexedIndiaData[id])
    );
    sp_merging.succeed();

    let sp_scatterplot = ora("Writing scatterplot layer").start();
    sp_scatterplot.color = "green";
    // write the data to file
    writeData({ filename: "layers/sctterplot.json", jsonObject: layerData });
    sp_scatterplot.succeed();

    let sp_country_data = ora("Generating country wise data...").start();
    const countryData = layerData.reduce((result, item) => {
      if (result[item.country_code]) {
        result[item.country_code].confirmed += item.data.confirmed;
        result[item.country_code].existing +=
          item.data.confirmed - (item.data.deaths + item.data.recovered);
        result[item.country_code].deaths += item.data.deaths;
        result[item.country_code].recovered += item.data.recovered;
      } else {
        result[item.country_code] = item.data;
      }
      return result;
    }, {});
    sp_country_data.succeed();

    let sp_mapping = ora("Generating geojon layer...").start();
    const mappedCountries = Object.keys(countries).map(country_code => {
      return {
        ...countries[country_code],
        properties: {
          ...countries[country_code].properties,
          data: countryData[country_code] || {
            confirmed: 0,
            existing: 0,
            deaths: 0,
            recovered: 0
          }
        }
      };
    });
    const countriesGeoJSON = {
      type: "FeatureCollection",
      features: mappedCountries
    };
    sp_mapping.succeed();

    let sp_geojson = ora("Writing geojson layer...").start();
    writeData({ filename: "layers/geo.json", jsonObject: countriesGeoJSON });
    sp_geojson.succeed();

    console.log("Completed!");
  } else {
    return null;
  }
}

module.exports = generateLayerData;
