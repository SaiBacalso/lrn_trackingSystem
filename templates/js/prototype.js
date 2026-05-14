const STORAGE_KEY = "lrn_students";
const UPLOAD_KEY = "lrn_upload_preview";

const seedStudents = [
  {
    lrn: "123456789012",
    name: "Juan Dela Cruz",
    sex: "Male",
    grade: "Grade 7",
    section: "Einstein",
    schoolYear: "2025-2026",
    status: "Active",
    grade7: "Enrolled",
    grade8: "Promoted",
    grade9: "Promoted",
    grade10: "Completed",
    finalStatus: "Straight-Path"
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
    grade9: "Promoted",
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
    grade8: "Promoted",
    grade9: "Dropped",
    grade10: "N/A",
    finalStatus: "Dropout"
  }
];

const uploadRows = [
  { lrn: "123456789016", name: "Carlo Mendoza", sex: "Male", grade: "Grade 7", section: "Einstein", schoolYear: "2025-2026", status: "Active" },
  { lrn: "123456789017", name: "Liza Ramos", sex: "Female", grade: "Grade 7", section: "Newton", schoolYear: "2025-2026", status: "Active" },
  { lrn: "123456789012", name: "Duplicate Sample", sex: "Male", grade: "Grade 7", section: "Einstein", schoolYear: "2025-2026", status: "Active" },
  { lrn: "", name: "Missing LRN Sample", sex: "Female", grade: "Grade 7", section: "Newton", schoolYear: "2025-2026", status: "Active" }
];

function getStudents() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedStudents));
  return seedStudents;
}

function saveStudents(students) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function badgeClass(status) {
  if (["Active", "Valid", "Straight-Path", "Enrolled", "Promoted"].includes(status)) return "bg-success";
  if (["Completed"].includes(status)) return "bg-primary";
  if (["Transferred In"].includes(status)) return "bg-info";
  if (["Repeater", "Irregular", "Missing LRN"].includes(status)) return "bg-warning text-dark";
  if (["Transferred Out", "Dropout", "Dropped", "Duplicate LRN"].includes(status)) return "bg-danger";
  return "bg-secondary";
}

function ensurePrototypeUi() {
  if (!document.querySelector(".prototype-toast-wrap")) {
    document.body.insertAdjacentHTML("beforeend", '<div class="prototype-toast-wrap"></div>');
  }

  if (!document.querySelector(".prototype-modal")) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="prototype-modal" aria-hidden="true">
        <div class="prototype-modal-backdrop" data-close-modal></div>
        <div class="prototype-modal-card" role="dialog" aria-modal="true">
          <div class="prototype-modal-header">
            <div>
              <h5 data-modal-title>System Message</h5>
              <span data-modal-subtitle>Temporary prototype action</span>
            </div>
            <button type="button" class="prototype-icon-btn" data-close-modal aria-label="Close">&times;</button>
          </div>
          <div class="prototype-modal-body" data-modal-body></div>
          <div class="prototype-modal-actions" data-modal-actions></div>
        </div>
      </div>
    `);

    document.querySelector(".prototype-modal").addEventListener("click", (event) => {
      if (event.target.matches("[data-close-modal]")) closeModal();
    });
  }
}

function notify(message, type = "info") {
  ensurePrototypeUi();
  const toast = document.createElement("div");
  toast.className = `prototype-toast ${type}`;
  toast.textContent = message;
  document.querySelector(".prototype-toast-wrap").appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 20);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

function openModal({ title, subtitle = "Temporary prototype action", body, actions }) {
  ensurePrototypeUi();
  const modal = document.querySelector(".prototype-modal");
  modal.querySelector("[data-modal-title]").textContent = title;
  modal.querySelector("[data-modal-subtitle]").textContent = subtitle;
  modal.querySelector("[data-modal-body]").innerHTML = body;
  modal.querySelector("[data-modal-actions]").innerHTML = actions || `
    <button type="button" class="btn custom-btn" data-close-modal>Done</button>
  `;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  const modal = document.querySelector(".prototype-modal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function studentDetails(student) {
  openModal({
    title: student.name,
    subtitle: "Student record preview",
    body: `
      <div class="prototype-detail-grid">
        <span>LRN</span><strong>${student.lrn}</strong>
        <span>Sex</span><strong>${student.sex}</strong>
        <span>Grade / Section</span><strong>${student.grade} - ${student.section}</strong>
        <span>School Year</span><strong>${student.schoolYear}</strong>
        <span>Status</span><strong>${student.status}</strong>
        <span>Final Status</span><strong>${student.finalStatus || "In Progress"}</strong>
      </div>
    `
  });
}

function openStudentForm(student, onSave) {
  const isEdit = Boolean(student);
  const data = student || {
    lrn: "",
    name: "",
    sex: "Female",
    grade: "Grade 7",
    section: "Einstein",
    schoolYear: "2025-2026",
    status: "Active"
  };

  openModal({
    title: isEdit ? "Edit Student" : "Add Student",
    subtitle: "Saved temporarily in this browser until a database is connected.",
    body: `
      <form class="prototype-form" id="studentPrototypeForm">
        <label>LRN
          <input class="form-control" name="lrn" value="${data.lrn}" ${isEdit ? "readonly" : ""} maxlength="12" required>
        </label>
        <label>Full Name
          <input class="form-control" name="name" value="${data.name}" required>
        </label>
        <label>Sex
          <select class="form-select" name="sex">
            <option ${data.sex === "Female" ? "selected" : ""}>Female</option>
            <option ${data.sex === "Male" ? "selected" : ""}>Male</option>
          </select>
        </label>
        <label>Grade Level
          <select class="form-select" name="grade">
            ${["Grade 7", "Grade 8", "Grade 9", "Grade 10"].map((grade) => `<option ${data.grade === grade ? "selected" : ""}>${grade}</option>`).join("")}
          </select>
        </label>
        <label>Section
          <select class="form-select" name="section">
            ${["Einstein", "Newton", "Darwin"].map((section) => `<option ${data.section === section ? "selected" : ""}>${section}</option>`).join("")}
          </select>
        </label>
        <label>Status
          <select class="form-select" name="status">
            ${["Active", "Completed", "Transferred In", "Transferred Out", "Repeater", "Dropped", "Archived"].map((status) => `<option ${data.status === status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </label>
      </form>
    `,
    actions: `
      <button type="button" class="btn btn-outline-secondary" data-close-modal>Cancel</button>
      <button type="submit" class="btn custom-btn" form="studentPrototypeForm">${isEdit ? "Save Changes" : "Add Student"}</button>
    `
  });

  document.getElementById("studentPrototypeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      ...data,
      lrn: form.get("lrn").trim(),
      name: form.get("name").trim(),
      sex: form.get("sex"),
      grade: form.get("grade"),
      section: form.get("section"),
      schoolYear: data.schoolYear || "2025-2026",
      status: form.get("status"),
      grade7: data.grade7 || "Enrolled",
      grade8: data.grade8 || "N/A",
      grade9: data.grade9 || "N/A",
      grade10: data.grade10 || "N/A",
      finalStatus: data.finalStatus || "In Progress"
    };

    if (!/^\d{12}$/.test(payload.lrn)) {
      notify("LRN must be exactly 12 digits.", "error");
      return;
    }

    if (!payload.name) {
      notify("Student name is required.", "error");
      return;
    }

    onSave(payload);
    closeModal();
  });
}

function byText(selector, text) {
  return [...document.querySelectorAll(selector)].find((el) => el.textContent.trim() === text);
}

function csvDownload(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function updateSummaryCards() {
  const students = getStudents();
  const cards = document.querySelectorAll(".dashboard-card h2");
  if (!cards.length) return;

  const active = students.filter((s) => s.status === "Active").length;
  const completed = students.filter((s) => s.status === "Completed" || s.finalStatus === "Straight-Path").length;
  const transferIn = students.filter((s) => s.status === "Transferred In").length;
  const transferOut = students.filter((s) => s.status === "Transferred Out" || s.finalStatus === "Transferred Out").length;
  const repeaters = students.filter((s) => s.status === "Repeater" || s.finalStatus === "Irregular").length;

  if (document.title.includes("Dashboard")) {
    cards[0].textContent = students.length;
    cards[1].textContent = transferIn;
    cards[2].textContent = transferOut;
    cards[3].textContent = repeaters;
  }

  if (document.title.includes("Student Records")) {
    cards[0].textContent = students.length;
    cards[1].textContent = active;
    cards[2].textContent = completed;
    cards[3].textContent = students.filter((s) => s.status === "Archived").length;
  }
}

function setupUploadPage() {
  if (!document.title.includes("LIS Upload")) return;

  const fileInput = document.querySelector('input[type="file"]');
  const previewBtn = byText("button", "Preview File");
  const importBtn = byText("button", "Import Records");
  const tbody = document.querySelector(".custom-table tbody");
  const summaryValues = document.querySelectorAll(".summary-item strong");

  function validatedRows() {
    const existing = getStudents().map((s) => s.lrn);
    return uploadRows.map((row) => {
      let validation = "Valid";
      if (!row.lrn) validation = "Missing LRN";
      if (row.lrn && existing.includes(row.lrn)) validation = "Duplicate LRN";
      return { ...row, validation };
    });
  }

  function renderPreview() {
    const rows = validatedRows();
    localStorage.setItem(UPLOAD_KEY, JSON.stringify(rows));
    tbody.innerHTML = rows.map((row) => `
      <tr>
        <td>${row.lrn || "-"}</td>
        <td>${row.name}</td>
        <td>${row.sex}</td>
        <td>${row.grade}</td>
        <td>${row.section}</td>
        <td>${row.status}</td>
        <td><span class="badge ${badgeClass(row.validation)}">${row.validation}</span></td>
      </tr>
    `).join("");

    summaryValues[0].textContent = rows.length;
    summaryValues[1].textContent = rows.filter((r) => r.validation === "Valid").length;
    summaryValues[2].textContent = rows.filter((r) => r.validation === "Duplicate LRN").length;
    summaryValues[3].textContent = rows.filter((r) => r.validation === "Missing LRN").length;
  }

  previewBtn?.addEventListener("click", () => {
    if (fileInput.files[0] && !/\.(xlsx|xls|csv)$/i.test(fileInput.files[0].name)) {
      notify("Only .xlsx, .xls, and .csv files are accepted.");
      return;
    }
    renderPreview();
    notify("Preview generated using demo rows. Database import can be connected later.");
  });

  importBtn?.addEventListener("click", () => {
    const rows = JSON.parse(localStorage.getItem(UPLOAD_KEY) || "[]");
    if (!rows.length) {
      notify("Preview the file first before importing.");
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
    renderPreview();
    notify(`${validRows.length} valid records imported to the temporary browser storage.`);
  });
}

function setupRecordsPage() {
  if (!document.title.includes("Student Records")) return;

  const tableBody = document.querySelector(".custom-table tbody");
  const addBtn = byText("button", "+ Add Student");
  const searchInput = document.querySelector('input[placeholder="Search by LRN or name"]');
  const filters = document.querySelectorAll(".panel .form-select");

  function currentFilters() {
    return {
      grade: filters[0]?.value || "All Grades",
      section: filters[1]?.value || "All Sections",
      status: filters[2]?.value || "All Status",
      schoolYear: filters[3]?.value || "2025-2026",
      search: searchInput?.value.toLowerCase().trim() || ""
    };
  }

  function render() {
    const f = currentFilters();
    const rows = getStudents().filter((student) => {
      const matchesSearch = !f.search || student.lrn.includes(f.search) || student.name.toLowerCase().includes(f.search);
      const matchesGrade = f.grade === "All Grades" || student.grade === f.grade;
      const matchesSection = f.section === "All Sections" || student.section === f.section;
      const matchesStatus = f.status === "All Status" || student.status === f.status;
      const matchesYear = student.schoolYear === f.schoolYear;
      return matchesSearch && matchesGrade && matchesSection && matchesStatus && matchesYear;
    });

    tableBody.innerHTML = rows.map((student) => `
      <tr>
        <td>${student.lrn}</td>
        <td>${student.name}</td>
        <td>${student.sex}</td>
        <td>${student.grade}</td>
        <td>${student.section}</td>
        <td>${student.schoolYear}</td>
        <td><span class="badge ${badgeClass(student.status)}">${student.status}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-primary" data-action="view" data-lrn="${student.lrn}">View</button>
          <button class="btn btn-sm btn-outline-warning" data-action="edit" data-lrn="${student.lrn}">Edit</button>
        </td>
      </tr>
    `).join("");
  }

  addBtn?.addEventListener("click", () => {
    openStudentForm(null, (newStudent) => {
      if (getStudents().some((student) => student.lrn === newStudent.lrn)) {
        notify("LRN already exists.", "error");
        return;
      }

      saveStudents([...getStudents(), newStudent]);
      updateSummaryCards();
      render();
      notify("Student added to temporary browser storage.", "success");
    });
  });

  tableBody?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const students = getStudents();
    const student = students.find((item) => item.lrn === button.dataset.lrn);
    if (!student) return;

    if (button.dataset.action === "view") {
      studentDetails(student);
      return;
    }

    openStudentForm(student, (updatedStudent) => {
      const index = students.findIndex((item) => item.lrn === updatedStudent.lrn);
      students[index] = updatedStudent;
      saveStudents(students);
      updateSummaryCards();
      render();
      notify("Student record updated in temporary browser storage.", "success");
    });
  });

  searchInput?.addEventListener("input", render);
  filters.forEach((filter) => filter.addEventListener("change", render));
  render();
}

function setupCohortPage() {
  if (!document.title.includes("Cohort Tracking")) return;

  const generateBtn = byText("button", "Generate Tracking");
  const searchInput = document.querySelector(".search-box");
  const tableBody = document.querySelector(".custom-table tbody");

  function render() {
    const search = (searchInput?.value || "").toLowerCase();
    const rows = getStudents().filter((student) => !search || student.lrn.includes(search) || student.name.toLowerCase().includes(search));
    tableBody.innerHTML = rows.map((student) => `
      <tr>
        <td>${student.lrn}</td>
        <td>${student.name}</td>
        <td><span class="badge ${badgeClass(student.grade7)}">${student.grade7 || "N/A"}</span></td>
        <td><span class="badge ${badgeClass(student.grade8)}">${student.grade8 || "N/A"}</span></td>
        <td><span class="badge ${badgeClass(student.grade9)}">${student.grade9 || "N/A"}</span></td>
        <td><span class="badge ${badgeClass(student.grade10)}">${student.grade10 || "N/A"}</span></td>
        <td><span class="badge ${badgeClass(student.finalStatus)}">${student.finalStatus || "In Progress"}</span></td>
      </tr>
    `).join("");
  }

  generateBtn?.addEventListener("click", () => {
    render();
    notify("Cohort tracking generated from temporary browser storage.");
  });
  searchInput?.addEventListener("input", render);
  render();
}

function setupReportsPage() {
  if (!document.title.includes("Reports")) return;

  const generateBtn = byText("button", "Generate");
  const exportBtn = byText("button", "Export Excel");
  const summaryValues = document.querySelectorAll(".summary-boxes strong");

  function refreshReport() {
    const students = getStudents();
    const original = students.length || 1;
    const completed = students.filter((s) => s.status === "Completed" || s.finalStatus === "Straight-Path").length;
    const transferOut = students.filter((s) => s.status === "Transferred Out" || s.finalStatus === "Transferred Out").length;
    const survival = Math.round((completed / original) * 100);

    summaryValues[0].textContent = original;
    summaryValues[1].textContent = completed;
    summaryValues[2].textContent = `${survival}%`;
    summaryValues[3].textContent = transferOut;
  }

  generateBtn?.addEventListener("click", () => {
    refreshReport();
    notify("Report generated using temporary browser storage.");
  });

  exportBtn?.addEventListener("click", () => {
    const rows = [
      ["LRN", "Student Name", "Grade", "Section", "School Year", "Status"],
      ...getStudents().map((s) => [s.lrn, s.name, s.grade, s.section, s.schoolYear, s.status])
    ];
    csvDownload("student-report.csv", rows);
  });

  refreshReport();
}

document.addEventListener("DOMContentLoaded", () => {
  getStudents();
  updateSummaryCards();
  setupUploadPage();
  setupRecordsPage();
  setupCohortPage();
  setupReportsPage();
});
