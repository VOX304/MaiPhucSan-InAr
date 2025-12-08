// src/routes/external.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/external.controller");

router.get("/orangehrm/salesmen", ctrl.getOrangeSalesmen);
router.get("/opencrx/accounts", ctrl.getOpencrxAccounts);

module.exports = router;
