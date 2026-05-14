const cleanUploadRows = window.LRN_SAMPLE_DATA?.cleanUploadRows || [];
const issueUploadRows = window.LRN_SAMPLE_DATA?.issueUploadRows || cleanUploadRows;

function setupUploadPage() {
  const fileInput = document.querySelector('input[type="file"]');
  const previewBtn = byText("button", "Preview File");
  const importBtn = byText("button", "Import Records");
  const schoolYearSelect = document.getElementById("schoolYearSelect");
  const addSchoolYearBtn = document.getElementById("addSchoolYearBtn");
  const tbody = document.querySelector(".custom-table tbody");
  const summaryValues = document.querySelectorAll(".summary-item strong");
  const pageSize = 10;
  let issuePage = 1;
  let currentIssueRows = [];
  const pager = document.createElement("div");
  pager.className = "validation-pager";
  document.querySelector(".table-responsive")?.after(pager);

  function renderSchoolYears(selectedYear) {
    const years = getSchoolYears();
    schoolYearSelect.innerHTML = years.map((year) => `<option ${year === selectedYear ? "selected" : ""}>${year}</option>`).join("");
  }

  function openSchoolYearModal() {
    openModal({
      title: "Add School Year",
      subtitle: "Enter the starting year. The ending year will be added automatically.",
      body: `
        <form class="prototype-form" id="schoolYearForm">
          <label>Start Year
            <input class="form-control" name="startYear" placeholder="2026" maxlength="4" required>
          </label>
          <label>School Year Preview
            <input class="form-control" name="previewYear" value="2026-2027" readonly>
          </label>
        </form>
      `,
      actions: `
        <button type="button" class="btn btn-outline-secondary" data-close-modal>Cancel</button>
        <button type="submit" class="btn custom-btn" form="schoolYearForm">Add School Year</button>
      `
    });

    const form = document.getElementById("schoolYearForm");
    const startInput = form.elements.startYear;
    const previewInput = form.elements.previewYear;

    startInput.addEventListener("input", () => {
      const start = Number(startInput.value);
      previewInput.value = /^\d{4}$/.test(startInput.value) ? `${start}-${start + 1}` : "";
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const start = Number(startInput.value);
      if (!/^\d{4}$/.test(startInput.value) || start < 2000 || start > 2099) {
        notify("Enter a valid 4-digit school year start.", "error");
        return;
      }

      const newYear = `${start}-${start + 1}`;
      const years = getSchoolYears();
      if (years.includes(newYear)) {
        notify("That school year already exists.", "error");
        return;
      }

      years.push(newYear);
      saveSchoolYears(years);
      renderSchoolYears(newYear);
      closeModal();
      notify(`${newYear} added to the school year list.`, "success");
    });
  }

  renderSchoolYears(schoolYearSelect?.value || "2025-2026");
  addSchoolYearBtn?.addEventListener("click", openSchoolYearModal);

  function validatedRows() {
    const selectedSchoolYear = schoolYearSelect?.value || "2025-2026";
    const selectedGrade = document.querySelector(".upload-panel .row .col-md-6:nth-child(2) .form-select")?.value || "Grade 7";
    const existing = getStudents().filter((student) => student.schoolYear === selectedSchoolYear).map((s) => s.lrn);
    const filename = fileInput.files[0]?.name || "";
    const sourceRows = /error|duplicate|missing/i.test(filename) ? issueUploadRows : cleanUploadRows;
    const seenInFile = new Set();

    return sourceRows.map((row) => {
      let validation = "Valid";
      if (!row.lrn) validation = "Missing LRN";
      if (row.lrn && (existing.includes(row.lrn) || seenInFile.has(row.lrn))) validation = "Duplicate LRN";
      if (row.lrn) seenInFile.add(row.lrn);
      return { ...row, schoolYear: selectedSchoolYear, grade: selectedGrade, validation };
    });
  }

  function renderIssueRows() {
    if (!currentIssueRows.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-muted text-center">No duplicate or missing LRNs found. The file is ready for import.</td></tr>';
      pager.innerHTML = "";
      return;
    }

    const totalPages = Math.ceil(currentIssueRows.length / pageSize);
    issuePage = Math.min(Math.max(issuePage, 1), totalPages);
    const start = (issuePage - 1) * pageSize;
    const pageRows = currentIssueRows.slice(start, start + pageSize);

    tbody.innerHTML = pageRows.map((row) => `
      <tr>
        <td>${row.rowNo}</td>
        <td>${row.lrn || "-"}</td>
        <td>${row.name}</td>
        <td>${row.grade}</td>
        <td>${row.section}</td>
        <td><span class="badge ${badgeClass(row.validation)}">${row.validation}</span></td>
      </tr>
    `).join("");

    pager.innerHTML = `
      <span>Showing ${start + 1}-${Math.min(start + pageSize, currentIssueRows.length)} of ${currentIssueRows.length} issue rows</span>
      <div>
        <button type="button" class="btn btn-outline-secondary btn-sm" data-page="prev" ${issuePage === 1 ? "disabled" : ""}>Previous</button>
        <span>Page ${issuePage} of ${totalPages}</span>
        <button type="button" class="btn btn-outline-secondary btn-sm" data-page="next" ${issuePage === totalPages ? "disabled" : ""}>Next</button>
      </div>
    `;
  }

  function renderPreview() {
    const rows = validatedRows();
    currentIssueRows = rows.filter((row) => row.validation !== "Valid");
    issuePage = 1;
    localStorage.setItem(UPLOAD_KEY, JSON.stringify(rows));
    renderIssueRows();

    summaryValues[0].textContent = rows.length;
    summaryValues[1].textContent = rows.filter((r) => r.validation === "Valid").length;
    summaryValues[2].textContent = rows.filter((r) => r.validation === "Duplicate LRN").length;
    summaryValues[3].textContent = rows.filter((r) => r.validation === "Missing LRN").length;
  }

  pager.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");
    if (!button) return;
    issuePage += button.dataset.page === "next" ? 1 : -1;
    renderIssueRows();
  });

  previewBtn?.addEventListener("click", () => {
    if (!fileInput.files[0]) {
      notify("Please select an Excel file before previewing.", "error");
      return;
    }

    if (fileInput.files[0] && !/\.(xlsx|xls)$/i.test(fileInput.files[0].name)) {
      notify("Only Excel files with .xlsx or .xls format are accepted.", "error");
      return;
    }
    renderPreview();
    notify("Validation complete. Only rows with duplicate or missing LRNs are shown.", "success");
  });

  importBtn?.addEventListener("click", () => {
    const rows = JSON.parse(localStorage.getItem(UPLOAD_KEY) || "[]");
    if (!rows.length) {
      notify("Preview the file first before importing.", "error");
      return;
    }

    const issueRows = rows.filter((row) => row.validation !== "Valid");
    if (issueRows.length) {
      notify("Import blocked. Fix duplicate or missing LRNs in the Excel file, then upload and preview again.", "error");
      return;
    }

    const validRows = rows.filter((row) => row.validation === "Valid").map((row) => ({
      ...row,
      grade7: "Enrolled",
      grade8: "N/A",
      grade9: "N/A",
      grade10: "N/A",
      finalStatus: "In Progress"
    }));

    saveStudents([...getStudents(), ...validRows]);
    localStorage.removeItem(UPLOAD_KEY);
    currentIssueRows = [];
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted text-center">${validRows.length} records were imported successfully. Preview again only if you want to validate another upload.</td></tr>`;
    pager.innerHTML = "";
    summaryValues[0].textContent = validRows.length;
    summaryValues[1].textContent = validRows.length;
    summaryValues[2].textContent = "0";
    summaryValues[3].textContent = "0";
    notify(`${validRows.length} valid records imported to the temporary browser storage.`, "success");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  getStudents();
  setupUploadPage();
});
