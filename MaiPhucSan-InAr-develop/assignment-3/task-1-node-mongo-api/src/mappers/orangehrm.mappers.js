// src/mappers/orangehrm.mapper.js
function mapOrangeEmployeeToSalesman(emp) {
  return {
    sid: parseInt(emp.empNumber),
    firstName: emp.firstName,
    middleName: emp.middleName || "",
    lastName: emp.lastName,
    email: emp.workEmail || "",
    hireDate: emp.joinedDate || "",
    department: emp.unit?.name || "Sales",
    supervisor:
      emp.supervisor?.firstName + " " + emp.supervisor?.lastName || null,
  };
}

module.exports = { mapOrangeEmployeeToSalesman };
