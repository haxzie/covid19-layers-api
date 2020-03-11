const correct = {
  "Others": {
    country: "Others",
    correct: {
      country: "Diamond Princess Cruise Ship",
      country_code: "DPCP",
      province: "Somewhere"
    }
  },
  "Brunei": {
    country: "Brunei",
    correct: {
      country_code: "BN"
    }
  },
  "Iran (Islamic Republic of)": {
    country: "Iran (Islamic Republic of)",
    correct: {
      country_code: "IR"
    }
  },
  "Republic of Korea": {
    country: "Republic of Korea",
    correct: {
      country_code: "KR"
    }
  },
  "Hong Kong SAR": {
    country: "Hong Kong SAR",
    correct: {
      country_code: "HK"
    }
  },
  "Taipei and environs": {
    country: "Taipei and environs",
    correct: {
      country: "Taiwan",
      country_code: "TW"
    }
  },
  "occupied Palestinian territory": {
    country: "occupied Palestinian territory",
    correct: {
      country: "Palestine, State of",
      country_code: "PS"
    }
  },
  "Macao SAR": {
    country: "Macao SAR",
    correct: {
      country: "Macao",
      country_code: "MO"
    }
  },
  "Republic of Moldova": {
    country: "Republic of Moldova",
    correct: {
      country_code: "MD"
    }
  },
  "Saint Martin": {
    country: "Saint Martin",
    correct: {
      country_code: "MF"
    }
  },
  "Holy See": {
    country: "Holy See",
    correct: {
      country_code: "VA"
    }
  }
};
function fixCountryCodes( data ) {
  return data.map(item => {
      if (correct[item.country]) {
          return {
              ...item,
              ...correct[item.country].correct
          }
      } else {
          return item
      }
  });
}

module.exports = fixCountryCodes;
