function setupCohortPage() {
  const searchInput = document.querySelector(".search-box");
  const startingSelect = document.getElementById("startingCohortSelect");
  const currentSelect = document.getElementById("currentCohortSelect");
  const statusFilter = document.getElementById("cohortStatusFilter");
  const tableBody = document.querySelector(".custom-table tbody");
  const pathYears = document.querySelectorAll(".path-box p");
  const summaryCards = document.querySelectorAll(".cards-section .dashboard-card h2");
  const movementValues = document.querySelectorAll(".status-list strong");
  const pageSize = 10;
  let cohortPage = 1;
  let currentRows = [];
  const pager = document.createElement("div");
  pager.className = "cohort-pager";
  document.querySelector(".table-responsive")?.after(pager);

  function renderCohortSchoolYears() {
    const years = getSchoolYears();
    const selectedStarting = startingSelect.value || years[years.length - 1] || "2022-2023";
    const selectedCurrent = currentSelect.value || years[years.length - 1] || "2025-2026";
    startingSelect.innerHTML = years.map((year) => `<option ${year === selectedStarting ? "selected" : ""}>${year}</option>`).join("");
    currentSelect.innerHTML = years.map((year) => `<option ${year === selectedCurrent ? "selected" : ""}>${year}</option>`).join("");
  }

  function schoolYearStart(year) {
    return Number(String(year).slice(0, 4));
  }

  function hasValidYearOrder() {
    return schoolYearStart(startingSelect.value) < schoolYearStart(currentSelect.value);
  }

  function nextSchoolYear(year, offset) {
    const start = Number(String(year).slice(0, 4));
    if (!start) return year;
    const nextStart = start + offset;
    return `${nextStart}-${nextStart + 1}`;
  }

  function updatePathYears() {
    const startYear = startingSelect.value || "2022-2023";
    pathYears.forEach((label, index) => {
      label.textContent = nextSchoolYear(startYear, index);
    });
  }

  function updateCohortSummary() {
    const startYear = startingSelect.value || "2022-2023";
    const currentYear = currentSelect.value || "2025-2026";
    const cohortRows = buildCohortRows(startYear, currentYear);
    const originalCohort = cohortRows.filter((student) => student.years.includes(startYear));

    summaryCards[0].textContent = originalCohort.length;
    summaryCards[1].textContent = cohortRows.filter((student) => student.finalStatus === "Regular").length;
    summaryCards[2].textContent = cohortRows.filter((student) => ["Irregular", "Repeater", "Needs Review"].includes(student.finalStatus)).length;

    movementValues[0].textContent = cohortRows.filter((student) => student.statuses.includes("Transferred In")).length;
    movementValues[1].textContent = cohortRows.filter((student) => student.finalStatus === "Transferred Out").length;
    movementValues[2].textContent = cohortRows.filter((student) => student.statuses.includes("Repeater")).length;
    movementValues[3].textContent = cohortRows.filter((student) => student.finalStatus === "Dropped Out").length;
  }

  function statusBadge(status) {
    if (!status || status === "Completed") return "";
    return `<span class="badge ${badgeClass(status)}">${status}</span>`;
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
      const key = record.lrn;
      if (!grouped.has(key)) {
        grouped.set(key, {
          lrn: record.lrn,
          name: record.name,
          grade7: "N/A",
          grade8: "N/A",
          grade9: "N/A",
          grade10: "N/A",
          finalStatus: "In Progress",
          statuses: [],
          years: []
        });
      }

      const student = grouped.get(key);
      const gradeField = gradeFieldName(record.grade);
      const status = normalizeStatusLabel(record.status || record[gradeField] || "Enrolled");
      if (gradeField) student[gradeField] = status;
      if (!student.statuses.includes(status)) student.statuses.push(status);
      if (!student.years.includes(record.schoolYear)) student.years.push(record.schoolYear);
      student.finalStatus = computeFinalStatus(student);
    });

    return [...grouped.values()];
  }

  function renderTable() {
    if (!currentRows.length) {
      tableBody.innerHTML = '<tr><td colspan="7" class="text-muted text-center">No cohort records found.</td></tr>';
      pager.innerHTML = "";
      return;
    }

    const totalPages = Math.ceil(currentRows.length / pageSize);
    cohortPage = Math.min(Math.max(cohortPage, 1), totalPages);
    const start = (cohortPage - 1) * pageSize;
    const rows = currentRows.slice(start, start + pageSize);

    tableBody.innerHTML = rows.map((student) => `
      <tr>
        <td>${student.lrn}</td>
        <td>${student.name}</td>
        <td>${statusBadge(student.grade7 || "N/A")}</td>
        <td>${statusBadge(student.grade8 || "N/A")}</td>
        <td>${statusBadge(student.grade9 || "N/A")}</td>
        <td>${statusBadge(student.grade10 || "N/A")}</td>
        <td>${statusBadge(student.finalStatus || "In Progress")}</td>
      </tr>
    `).join("");

    pager.innerHTML = `
      <span>Showing ${start + 1}-${Math.min(start + pageSize, currentRows.length)} of ${currentRows.length} students</span>
      <div>
        <button type="button" class="btn btn-outline-secondary btn-sm" data-page="prev" ${cohortPage === 1 ? "disabled" : ""}>Previous</button>
        <span>Page ${cohortPage} of ${totalPages}</span>
        <button type="button" class="btn btn-outline-secondary btn-sm" data-page="next" ${cohortPage === totalPages ? "disabled" : ""}>Next</button>
      </div>
    `;
  }

  function render(resetPage = false) {
    if (resetPage) cohortPage = 1;
    updatePathYears();
    updateCohortSummary();

    if (!hasValidYearOrder()) {
      currentRows = [];
      tableBody.innerHTML = '<tr><td colspan="7" class="text-muted text-center">Starting school year must be earlier than the current school year.</td></tr>';
      pager.innerHTML = "";
      notify("Starting school year must be earlier than current school year.", "error");
      return;
    }

    const search = (searchInput?.value || "").toLowerCase();
    const selectedStatus = statusFilter.value || "All Status";
    currentRows = buildCohortRows(startingSelect.value || "2022-2023", currentSelect.value || "2025-2026").filter((student) => {
      const matchesSearch = !search || student.lrn.includes(search) || student.name.toLowerCase().includes(search);
      const finalStatus = student.finalStatus || "In Progress";
      const matchesStatus = selectedStatus === "All Status" || finalStatus === selectedStatus;
      return matchesSearch && matchesStatus;
    });
    renderTable();
  }

  pager.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");
    if (!button) return;
    cohortPage += button.dataset.page === "next" ? 1 : -1;
    renderTable();
  });

  searchInput?.addEventListener("input", () => render(true));
  [startingSelect, currentSelect, statusFilter].forEach((select) => select?.addEventListener("change", () => render(true)));
  onStudentDataChanged(() => render(true));
  renderCohortSchoolYears();
  render(true);
}

document.addEventListener("DOMContentLoaded", () => {
  getStudents();
  setupCohortPage();
});
