
// "Social performance records" - one record per salesman + year
// Each record contains multiple goals with supervisor/peer group values.
module.exports = [
  {
    id: "sp-90123-2025",
    salesmanId: "90123",
    year: 2025,
    goals: [
      { goalId: "leadership", description: "Leadership competence", valueSupervisor: 4, valuePeerGroup: 4 },
      { goalId: "openness", description: "Openness to employees", valueSupervisor: 4, valuePeerGroup: 3 },
      { goalId: "behaviour", description: "Social behaviour to employees", valueSupervisor: 4, valuePeerGroup: 4 },
      { goalId: "attitude", description: "Attitude towards clients", valueSupervisor: 4, valuePeerGroup: 4 },
      { goalId: "communication", description: "Communication skills", valueSupervisor: 5, valuePeerGroup: 5 },
      { goalId: "integrity", description: "Integrity to company", valueSupervisor: 4, valuePeerGroup: 4 }
    ],
    remarks: "Good job! Should improve with Dirk."
  },
  {
    id: "sp-90124-2025",
    salesmanId: "90124",
    year: 2025,
    goals: [
      { goalId: "leadership", description: "Leadership competence", valueSupervisor: 3, valuePeerGroup: 3 },
      { goalId: "openness", description: "Openness to employees", valueSupervisor: 3, valuePeerGroup: 3 },
      { goalId: "behaviour", description: "Social behaviour to employees", valueSupervisor: 3, valuePeerGroup: 3 },
      { goalId: "attitude", description: "Attitude towards clients", valueSupervisor: 4, valuePeerGroup: 3 },
      { goalId: "communication", description: "Communication skills", valueSupervisor: 4, valuePeerGroup: 4 },
      { goalId: "integrity", description: "Integrity to company", valueSupervisor: 3, valuePeerGroup: 3 }
    ],
    remarks: "Solid performance."
  }
];
