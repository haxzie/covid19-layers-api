const mongoose = require("mongoose");
const Event = require("./event.model");

const regionSchema = new mongoose.Schema({
  state: {
    type: String
  },
  country: {
    type: String,
    required: true
  },
  regionType: {
    type: String
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  cases: [
    {
      case: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Case"
      },
      timeline: [Event]
    }
  ]
});

module.exports = mongoose.model("Region", regionSchema);
