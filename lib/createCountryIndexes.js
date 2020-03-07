const fs = require("fs");
const path = require("path");

function readJSON({ filename }) {
  const file = fs.readFileSync(path.resolve(__dirname, filename)).toString();
  const jsonObject = JSON.parse(file);
  return jsonObject;
}

function writeJSON({ filename, data }) {
  fs.writeFileSync(path.resolve(__dirname, filename), data);
}

function createCountryIndexes() {
  const countries = readJSON({ filename: "../data/countries.geo.json" });
  const countryCodes = readJSON({ filename: "../data/country_codes.json" });

  const indexedCountryCodes = countryCodes.reduce((result, item) => {
    return Object.assign(result, {
      [item["alpha-3"]]: {
        alpha2: item["alpha-2"]
      }
    });
  }, {});

  console.log(indexedCountryCodes);

  // create an indexed object of countries
  const indexedCountries = countries.features.reduce((result, country) => {
    if (indexedCountryCodes[country.id]) {
      let a2 = indexedCountryCodes[country.id].alpha2;
      return Object.assign(result, {
        [a2]: {
          ...country
        }
      });
    } else {
      return result;
    }
  }, {});

  // save the file for future uses
  writeJSON({
    filename: "../data/indexed_countries.json",
    data: JSON.stringify(indexedCountries, null, 2)
  });

  return indexedCountries;
}

module.exports = createCountryIndexes;
