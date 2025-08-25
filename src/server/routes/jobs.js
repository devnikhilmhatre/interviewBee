const express = require("express");
const router = express.Router();
const { list } = require("../handlers/jobs");

// GET /jobs?search=&location=&tags=&sort=&order=&page=&limit=
router.get("/jobs", list);

module.exports = router;
