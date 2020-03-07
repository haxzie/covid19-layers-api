const createCountryIndexes = require('./createCountryIndexes');
const { getAllData } = require('./covid19api');
const fs = require('fs');
const path = require('path');
const Layer = require('../models/layer.model');
const crypto = require('crypto');

/**
 * Writes json objects to the data directory
 * @param {Object} data
 * @param {String} data.filename Filename of the data
 * @param {Object} data.jsonObject JSON object to be written
 */
function writeData({ filename, jsonObject }) {
    try {   
        fs.writeFileSync(path.resolve(__dirname, '../data', filename), JSON.stringify(jsonObject, null, 2) );
    } catch(error) {
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
            return new Layer({ id: layerId, value: layerObject[layerId ]});
        });
        
        writeData({ filename: 'layers/layers.json', jsonObject: data });
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
        const hashKey = keys.map(key => item[key] || '').join('_');
        // create a hash for the key
        const hash = crypto.createHash('md5').update(hashKey).digest("hex").toString();
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
    const countries = createCountryIndexes();
    const response = await getAllData();
    const { status, data } = response;

    if (status === 200 && data) {
        const { latest, confirmed, deaths, recovered } = data;
        // save the layers
        createLayers(latest);
        // join the data into single object
        const indexedConfirms = await createIndexes({ data: confirmed.locations, keys: ["country_code", "province"] });
        const indexedDeaths = await createIndexes({ data: deaths.locations, keys: ["country_code", "province"] });
        const indexedRecovered = await createIndexes({ data: recovered.locations, keys: ["country_code", "province"] });
        
        let layerData = await Object.keys(indexedConfirms).map(key => {
            const confirmData = indexedConfirms[key];
            return {
                id: key,
                location: [confirmData.coordinates.lat, confirmData.coordinates.long],
                country: confirmData.country,
                country_code: confirmData.country_code,
                province: confirmData.province,
                data: {
                    confirmed: confirmData.latest,
                    deaths: indexedDeaths[key]? indexedDeaths[key].latest: 0,
                    recovered: indexedRecovered[key]? indexedRecovered[key].latest: 0
                }
            }
        });
        // write the data to file
        writeData({ filename: 'layers/sctterplot.json', jsonObject: layerData });

        const countryData = layerData.reduce(( result, item) => {
            if (result[item.country_code]) {
                result[item.country_code].confirmed += item.data.confirmed;
                result[item.country_code].deaths += item.data.deaths;
                result[item.country_code].recovered += item.data.recovered;
            } else {
                result[item.country_code] = item.data;
            };
            return result;
        }, {})

        console.log(countryData)
        const mappedCountries = Object.keys(countries).map(country_code => {
            return {
                ...countries[country_code],
                properties: {
                    ...countries[country_code].properties,
                    data: countryData[country_code] || { confirmed: 0, deaths: 0, recovered: 0 }
                }
            }
        });

        const countriesGeoJSON = {
            "type":"FeatureCollection","features": mappedCountries
        }

        writeData({ filename: 'layers/geo.json', jsonObject: countriesGeoJSON });
        
    } else {
        return null;
    }
}

module.exports = generateLayerData;