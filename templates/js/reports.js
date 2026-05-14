function setupReportsPage() {
  const exportBtn = byText("button", "Export Excel");
  const reportTypeFilter = document.getElementById("reportTypeFilter");
  const startYearFilter = document.getElementById("reportStartYearFilter");
  const schoolYearFilter = document.getElementById("reportSchoolYearFilter");
  const gradeFilter = document.getElementById("reportGradeFilter");
  const summaryValues = document.querySelectorAll(".summary-boxes strong");
  const summaryLabels = [
    document.getElementById("summaryLabelOne"),
    document.getElementById("summaryLabelTwo"),
    document.getElementById("summaryLabelThree"),
    document.getElementById("summaryLabelFour")
  ];
  const reportTitle = document.getElementById("reportTitle");
  const reportMeta = document.getElementById("reportMeta");
  const previewSubtitle = document.getElementById("reportPreviewSubtitle");
  const tableHead = document.querySelector(".report-document thead tr");
  const tableBody = document.querySelector(".report-document tbody");
  let currentExportRows = [];

  function renderYearOptions() {
    const years = getSchoolYears();
    const selectedStart = startYearFilter.value || years[0] || "2022-2023";
    const selectedSchoolYear = schoolYearFilter.value || "All School Years";

    startYearFilter.innerHTML = years.map((year) => `<option ${year === selectedStart ? "selected" : ""}>${year}</option>`).join("");
    schoolYearFilter.innerHTML = [
      `<option ${selectedSchoolYear === "All School Years" ? "selected" : ""}>All School Years</option>`,
      ...years.map((year) => `<option ${year === selectedSchoolYear ? "selected" : ""}>${year}</option>`)
    ].join("");
  }

  function schoolYearStart(year) {
    return Number(String(year).slice(0, 4));
  }

  function yearInRange(year, startYear, currentYear) {
    const yearStart = schoolYearStart(year);
    return yearStart >= schoolYearStart(startYear) && yearStart <= schoolYearStart(currentYear);
  }

  function computeFinalStatus(student) {
    if (student.statuses.includes("Dropped Out")) return "Dropped Out";
    if (student.statuses.includes("Transferred Out")) return "Transferred Out";
    if (student.statuses.includes("Repeater")) return "Irregular";
    if (["grade7", "grade8", "grade9", "grade10"].every((grade) => student[grade] === "Enrolled" || student[grade] === "Transferred In")) return "Regular";
    return "In Progress";
  }

  function buildCohortRows(startYear, currentYear) {
    const grouped = new Map();
    const records = getActiveStudents()
      .filter((student) => yearInRange(student.schoolYear, startYear, currentYear))
      .sort((a, b) => schoolYearStart(a.schoolYear) - schoolYearStart(b.schoolYear));

    records.forEach((record) => {
      if (!grouped.has(record.lrn)) {
        grouped.set(record.lrn, {
          lrn: record.lrn,
          name: record.name,
          grade7: "N/A",
          grade8: "N/A",
          grade9: "N/A",
          grade10: "N/A",
          finalStatus: "In Progress",
          statuses: []
        });
      }

      const student = grouped.get(record.lrn);
      const gradeField = gradeFieldName(record.grade);
      const status = normalizeStatusLabel(record.status || record[gradeField] || "Enrolled");
      if (gradeField) student[gradeField] = status;
      if (!student.statuses.includes(status)) student.statuses.push(status);
      student.finalStatus = computeFinalStatus(student);
    });

    return [...grouped.values()];
  }

  function filteredMasterlistRows() {
    const selectedYear = schoolYearFilter.value || "All School Years";
    const selectedGrade = gradeFilter.value || "All Grade Levels";
    return getActiveStudents().filter((student) => {
      const matchesYear = selectedYear === "All School Years" || student.schoolYear === selectedYear;
      const matchesGrade = selectedGrade === "All Grade Levels" || student.grade === selectedGrade;
      return matchesYear && matchesGrade;
    });
  }

  function setSummary(labels, values) {
    labels.forEach((label, index) => {
      summaryLabels[index].textContent = label;
      summaryValues[index].textContent = values[index];
    });
  }

  function renderCohortReport() {
    const years = getSchoolYears();
    const startYear = startYearFilter.value || years[0] || "2022-2023";
    const currentYear = schoolYearFilter.value === "All School Years" ? years[years.length - 1] : schoolYearFilter.value || years[years.length - 1];
    const rows = buildCohortRows(startYear, currentYear);
    const regular = rows.filter((student) => student.finalStatus === "Regular").length;
    const transferOut = rows.filter((student) => student.finalStatus === "Transferred Out").length;
    const progressionRate = rows.length ? Math.round((regular / rows.length) * 100) : 0;

    reportTitle.textContent = "Cohort Progression Summary";
    reportMeta.textContent = `School Year ${currentYear} | Starting Cohort ${startYear}`;
    previewSubtitle.textContent = "Cohort movement summary based on current student records.";
    setSummary(
      ["Original Cohort", "Regular", "Progression Rate", "Transfer-Out"],
      [rows.length, regular, `${progressionRate}%`, transferOut]
    );

    tableHead.innerHTML = `
      <th>LRN</th>
      <th>Student Name</th>
      <th>Grade 7</th>
      <th>Grade 8</th>
      <th>Grade 9</th>
      <th>Grade 10</th>
      <th>Final Status</th>
    `;

    tableBody.innerHTML = rows.length ? rows.map((student) => `
      <tr>
        <td>${student.lrn}</td>
        <td>${student.name}</td>
        <td>${student.grade7 === "Completed" ? "" : student.grade7}</td>
        <td>${student.grade8 === "Completed" ? "" : student.grade8}</td>
        <td>${student.grade9 === "Completed" ? "" : student.grade9}</td>
        <td>${student.grade10 === "Completed" ? "" : student.grade10}</td>
        <td><span class="badge ${badgeClass(student.finalStatus)}">${student.finalStatus}</span></td>
      </tr>
    `).join("") : '<tr><td colspan="7" class="text-muted text-center">No report records found.</td></tr>';

    currentExportRows = [
      ["LRN", "Student Name", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Final Status"],
      ...rows.map((student) => [student.lrn, student.name, student.grade7, student.grade8, student.grade9, student.grade10, student.finalStatus])
    ];
  }

  function renderMasterlistReport() {
    const selectedYear = schoolYearFilter.value || "All School Years";
    const selectedGrade = gradeFilter.value || "All Grade Levels";
    const rows = filteredMasterlistRows();
    const uniqueStudents = new Set(rows.map((student) => student.lrn)).size;

    reportTitle.textContent = "Student Masterlist";
    reportMeta.textContent = `${selectedYear} | ${selectedGrade}`;
    previewSubtitle.textContent = "Student record list based on the selected filters.";
    setSummary(
      ["Total Records", "Unique Students", "Enrolled", "Transfer-Out"],
      [
        rows.length,
        uniqueStudents,
        rows.filter((student) => ["Enrolled", "Active", "Transferred In"].includes(student.status)).length,
        rows.filter((student) => student.status === "Transferred Out").length
      ]
    );

    tableHead.innerHTML = `
      <th>LRN</th>
      <th>Student Name</th>
      <th>Sex</th>
      <th>Grade</th>
      <th>School Year</th>
      <th>Status</th>
    `;

    tableBody.innerHTML = rows.length ? rows.map((student) => `
      <tr>
        <td>${student.lrn}</td>
        <td>${student.name}</td>
        <td>${student.sex}</td>
        <td>${student.grade}</td>
        <td>${student.schoolYear}</td>
        <td><span class="badge ${badgeClass(student.status)}">${student.status}</span></td>
      </tr>
    `).join("") : '<tr><td colspan="6" class="text-muted text-center">No report records found.</td></tr>';

    currentExportRows = [
      ["LRN", "Student Name", "Sex", "Grade", "School Year", "Status"],
      ...rows.map((student) => [student.lrn, student.name, student.sex, student.grade, student.schoolYear, student.status])
    ];
  }

  function refreshReport() {
    if (reportTypeFilter.value === "Student Masterlist") {
      renderMasterlistReport();
      return;
    }
    renderCohortReport();
  }

  [reportTypeFilter, startYearFilter, schoolYearFilter, gradeFilter].forEach((filter) => filter.addEventListener("change", refreshReport));
  exportBtn?.addEventListener("click", () => {
    const filename = reportTypeFilter.value === "Student Masterlist" ? "student-masterlist.csv" : "cohort-progression-summary.csv";
    csvDownload(filename, currentExportRows);
  });

  onStudentDataChanged(refreshReport);
  renderYearOptions();
  refreshReport();
}

document.addEventListener("DOMContentLoaded", () => {
  getStudents();
  setupReportsPage();
});
