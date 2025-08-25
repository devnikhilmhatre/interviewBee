const express = require("express");
const cors = require("cors");
const jobsRoutes = require("./routes/jobs");

const app = express();
app.use(cors());
app.use(express.json());

// GET /jobs
app.use("/", jobsRoutes);

// GET /health
app.get("/health", (_, res) => res.send("API is running"));

module.exports = { app };
