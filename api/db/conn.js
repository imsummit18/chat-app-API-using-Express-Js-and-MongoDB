const { default: mongoose } = require("mongoose");

const connectDB = (url) => {
  return mongoose
    .connect(url)
    .then(() => {
      console.log("Connected to database");
    })
    .catch((err) => {
      console.log("Error while connecting to database", err);
    });
};
module.exports = connectDB;
