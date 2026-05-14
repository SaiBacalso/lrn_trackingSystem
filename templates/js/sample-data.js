window.LRN_SAMPLE_DATA = {
  students: [
    {
      lrn: "123456789012",
      name: "Juan Dela Cruz",
      sex: "Male",
      grade: "Grade 7",
      section: "Einstein",
      schoolYear: "2025-2026",
      status: "Active",
      grade7: "Enrolled",
      grade8: "Enrolled",
      grade9: "Enrolled",
      grade10: "Completed",
      finalStatus: "Regular"
    },
    {
      lrn: "123456789013",
      name: "Maria Santos",
      sex: "Female",
      grade: "Grade 8",
      section: "Newton",
      schoolYear: "2025-2026",
      status: "Transferred In",
      grade7: "Enrolled",
      grade8: "Repeater",
      grade9: "Enrolled",
      grade10: "Completed",
      finalStatus: "Irregular"
    },
    {
      lrn: "123456789014",
      name: "Pedro Reyes",
      sex: "Male",
      grade: "Grade 9",
      section: "Darwin",
      schoolYear: "2025-2026",
      status: "Repeater",
      grade7: "Enrolled",
      grade8: "Transferred Out",
      grade9: "N/A",
      grade10: "N/A",
      finalStatus: "Transferred Out"
    },
    {
      lrn: "123456789015",
      name: "Ana Lopez",
      sex: "Female",
      grade: "Grade 10",
      section: "Einstein",
      schoolYear: "2025-2026",
      status: "Completed",
      grade7: "Enrolled",
      grade8: "Enrolled",
      grade9: "Dropped Out",
      grade10: "N/A",
      finalStatus: "Dropped Out"
    }
  ],

  cleanUploadRows: [
    { rowNo: 2, lrn: "123456789016", name: "Carlo Mendoza", sex: "Male", grade: "Grade 7", section: "Einstein", schoolYear: "2025-2026", status: "Active" },
    { rowNo: 3, lrn: "123456789017", name: "Liza Ramos", sex: "Female", grade: "Grade 7", section: "Newton", schoolYear: "2025-2026", status: "Active" },
    { rowNo: 4, lrn: "123456789018", name: "Mark Villanueva", sex: "Male", grade: "Grade 7", section: "Darwin", schoolYear: "2025-2026", status: "Active" },
    { rowNo: 5, lrn: "123456789019", name: "Angela Cruz", sex: "Female", grade: "Grade 7", section: "Einstein", schoolYear: "2025-2026", status: "Active" }
  ]
};

window.LRN_SAMPLE_DATA.issueUploadRows = [
  ...window.LRN_SAMPLE_DATA.cleanUploadRows,
  { rowNo: 6, lrn: "123456789012", name: "Duplicate Sample", sex: "Male", grade: "Grade 7", section: "Einstein", schoolYear: "2025-2026", status: "Active" },
  { rowNo: 7, lrn: "", name: "Missing LRN Sample", sex: "Female", grade: "Grade 7", section: "Newton", schoolYear: "2025-2026", status: "Active" }
];
