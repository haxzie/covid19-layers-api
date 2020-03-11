const mongoose = require("mongoose");

function connectDatabase() {
  mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const db = mongoose.connection;
  db.on("error", error => console.error(error));
  db.once("open", () => console.log("connected to database"));
  return db;
}

module.exports = connectDatabase;
