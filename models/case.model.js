const mongoose = require("mongoose");
const Event = require("./event.model");

const caseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  latest: {
    type: Number
  },
  lastUpdated: {
    type: Date
  },
  timeline: [Event]
});

module.exports = mongoose.model("Case", caseSchema);
