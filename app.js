const express = require("express");
const app = express();
const routes = require("./routes");

app.use(express.json());
app.use("/api", routes); // Prefix all routes with `/api`

module.exports = app;
