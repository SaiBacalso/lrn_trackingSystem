function setupRecordsPage() {
  const tableBody = document.querySelector(".custom-table tbody");
  const addBtn = byText("button", "+ Add Student");
  const searchInput = document.querySelector('input[placeholder="Search by LRN or name"]');
  const gradeFilter = document.getElementById("recordsGradeFilter");
  const recordViewFilter = document.getElementById("recordsViewFilter");
  const schoolYearFilter = document.getElementById("recordsSchoolYearFilter");
  const filters = [gradeFilter, recordViewFilter, schoolYearFilter].filter(Boolean);
  const pageSize = 10;
  let studentPage = 1;
  let currentRows = [];
  const pager = document.createElement("div");
  pager.className = "records-pager";
  document.querySelector(".table-responsive")?.after(pager);

  function renderSchoolYearFilter(selectedYear) {
    const years = getSchoolYears();
    const selected = selectedYear || "All School Years";
    schoolYearFilter.innerHTML = [
      `<option ${selected === "All School Years" ? "selected" : ""}>All School Years</option>`,
      ...years.map((year) => `<option ${year === selected ? "selected" : ""}>${year}</option>`)
    ].join("");
  }

  function currentFilters() {
    return {
      grade: gradeFilter?.value || "All Grades",
      recordView: recordViewFilter?.value || "All Records",
      schoolYear: schoolYearFilter?.value || "All School Years",
      search: searchInput?.value.toLowerCase().trim() || ""
    };
  }

  function updateRecordSummary() {
    const year = schoolYearFilter?.value || "All School Years";
    const students = getStudents().filter((student) => year === "All School Years" || student.schoolYear === year);
    const activeRecords = students.filter((student) => student.status !== "Archived");
    const cards = document.querySelectorAll(".dashboard-card h2");

    if (!cards.length) return;
    cards[0].textContent = activeRecords.length;
    cards[1].textContent = activeRecords.filter((student) => ["Active", "Enrolled", "Transferred In"].includes(student.status)).length;
    cards[2].textContent = activeRecords.filter((student) => student.status === "Completed").length;
    cards[3].textContent = students.filter((student) => student.status === "Archived").length;
  }

  function filteredRows() {
    const f = currentFilters();
    return getStudents().map((student, index) => ({ ...student, recordIndex: index })).filter((student) => {
      const matchesSearch = !f.search || student.lrn.includes(f.search) || student.name.toLowerCase().includes(f.search);
      const matchesGrade = f.grade === "All Grades" || student.grade === f.grade;
      const matchesRecordView =
        f.recordView === "Archived Records" ? student.status === "Archived" :
        f.recordView === "Current Records" ? student.status !== "Archived" :
        true;
      const matchesYear = f.schoolYear === "All School Years" || student.schoolYear === f.schoolYear;
      return matchesSearch && matchesGrade && matchesRecordView && matchesYear;
    });
  }

  function renderTable() {
    if (!currentRows.length) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-muted text-center">No student records found for the selected filters.</td></tr>';
      pager.innerHTML = "";
      return;
    }

    const totalPages = Math.ceil(currentRows.length / pageSize);
    studentPage = Math.min(Math.max(studentPage, 1), totalPages);
    const start = (studentPage - 1) * pageSize;
    const rows = currentRows.slice(start, start + pageSize);

    tableBody.innerHTML = rows.map((student) => `
      <tr>
        <td>${student.lrn}</td>
        <td>${student.name}</td>
        <td>${student.sex}</td>
        <td>${student.grade}</td>
        <td>${student.schoolYear}</td>
        <td class="table-actions">
          ${student.status === "Archived"
            ? '<span class="text-muted">Archived</span>'
            : `
              <button class="btn btn-sm btn-outline-warning" data-action="edit" data-index="${student.recordIndex}">Edit</button>
              <button class="btn btn-sm btn-outline-secondary" data-action="archive" data-index="${student.recordIndex}">Archive</button>
            `}
        </td>
      </tr>
    `).join("");

    pager.innerHTML = `
      <span>Showing ${start + 1}-${Math.min(start + pageSize, currentRows.length)} of ${currentRows.length} students</span>
      <div>
        <button type="button" class="btn btn-outline-secondary btn-sm" data-page="prev" ${studentPage === 1 ? "disabled" : ""}>Previous</button>
        <span>Page ${studentPage} of ${totalPages}</span>
        <button type="button" class="btn btn-outline-secondary btn-sm" data-page="next" ${studentPage === totalPages ? "disabled" : ""}>Next</button>
      </div>
    `;
  }

  function render(resetPage = false) {
    if (resetPage) studentPage = 1;
    currentRows = filteredRows();
    updateRecordSummary();
    renderTable();
  }

  addBtn?.addEventListener("click", () => {
    openStudentForm(null, (newStudent) => {
      const students = getStudents();
      const sameLrnDifferentName = students.some((student) => student.lrn === newStudent.lrn && student.name.toLowerCase() !== newStudent.name.toLowerCase());
      const sameYearRecord = students.some((student) => student.lrn === newStudent.lrn && student.schoolYear === newStudent.schoolYear);

      if (sameLrnDifferentName) {
        notify("This LRN already belongs to another student name.", "error");
        return;
      }

      if (sameYearRecord) {
        notify("This student already has a record for the selected school year.", "error");
        return;
      }

      saveStudents([...students, newStudent]);
      render(true);
      notify("Student added to temporary browser storage.", "success");
    }, { schoolYear: schoolYearFilter?.value === "All School Years" ? "2025-2026" : schoolYearFilter?.value || "2025-2026" });
  });

  tableBody?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const students = getStudents();
    const recordIndex = Number(button.dataset.index);
    const student = students[recordIndex];
    if (!student) return;

    if (button.dataset.action === "archive") {
      openModal({
        title: "Archive Student",
        subtitle: "Archived records stay in the system but are separated from active records.",
        body: `<p class="text-muted mb-0">Archive <strong>${student.name}</strong>?</p>`,
        actions: `
          <button type="button" class="btn btn-outline-secondary" data-close-modal>Cancel</button>
          <button type="button" class="btn custom-btn" id="confirmArchiveBtn">Archive</button>
        `
      });

      document.getElementById("confirmArchiveBtn").addEventListener("click", () => {
        student.status = "Archived";
        saveStudents(students);
        closeModal();
        render(true);
        notify("Student record archived.", "success");
      });
      return;
    }

    openStudentForm(student, (updatedStudent) => {
      const sameYearRecord = students.some((item, index) => index !== recordIndex && item.lrn === updatedStudent.lrn && item.schoolYear === updatedStudent.schoolYear);
      if (sameYearRecord) {
        notify("This student already has a record for the selected school year.", "error");
        return;
      }

      students[recordIndex] = updatedStudent;
      saveStudents(students);
      render();
      notify("Student record updated in temporary browser storage.", "success");
    });
  });

  pager.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");
    if (!button) return;
    studentPage += button.dataset.page === "next" ? 1 : -1;
    renderTable();
  });

  searchInput?.addEventListener("input", () => render(true));
  filters.forEach((filter) => filter.addEventListener("change", () => render(true)));
  onStudentDataChanged(() => render(true));
  renderSchoolYearFilter(schoolYearFilter?.value || "All School Years");
  render(true);
}

document.addEventListener("DOMContentLoaded", () => {
  getStudents();
  setupRecordsPage();
});
