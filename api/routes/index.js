const express = require("express");
const app = express.Router();
const userRoute = require("./userRoutes");

app.use("/user", userRoute);
module.exports = app;
