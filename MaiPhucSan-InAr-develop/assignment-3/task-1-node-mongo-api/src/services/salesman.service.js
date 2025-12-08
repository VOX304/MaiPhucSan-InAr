// src/services/salesman.service.js
const Salesman = require("../models/salesman.model");
const { getEmployees } = require("../integrations/orangehrm.client");
const { mapOrangeEmployeeToSalesman } = require("../mappers/orangehrm.mapper");

async function getAllLocalSalesmen() {
  return await Salesman.find();
}

async function addSalesman(data) {
  const s = new Salesman(data);
  return await s.save();
}

async function getSalesmenFromOrangeHRM() {
  const employees = await getEmployees();
  return employees.map(mapOrangeEmployeeToSalesman);
}

module.exports = { getAllLocalSalesmen, addSalesman, getSalesmenFromOrangeHRM };