const STORAGE_KEY = "lrn_students";
const UPLOAD_KEY = "lrn_upload_preview";
const SCHOOL_YEARS_KEY = "lrn_school_years";
const STUDENT_DATA_CHANGED_EVENT = "lrn_students_changed";

const seedStudents = window.LRN_SAMPLE_DATA?.students || [];

function getStudents() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const students = JSON.parse(saved).map(normalizeStudentLabels);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    return students;
  }
  const students = seedStudents.map(normalizeStudentLabels);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  return students;
}

function getActiveStudents() {
  return getStudents().filter((student) => student.status !== "Archived");
}

function saveStudents(students) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students.map(normalizeStudentLabels)));
  window.dispatchEvent(new CustomEvent(STUDENT_DATA_CHANGED_EVENT));
}

function onStudentDataChanged(callback) {
  window.addEventListener(STUDENT_DATA_CHANGED_EVENT, callback);
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) callback();
  });
}

function normalizeStatusLabel(status) {
  const labels = {
    "Active": "Enrolled",
    "Straight-Path": "Regular",
    "On Track": "Regular",
    "Promoted": "Enrolled",
    "Repeated": "Repeater",
    "Dropped": "Dropped Out",
    "Dropout": "Dropped Out"
  };
  return labels[status] || status;
}

function gradeFieldName(grade) {
  const gradeNumber = String(grade || "").match(/\d+/)?.[0];
  return gradeNumber ? `grade${gradeNumber}` : "";
}

function normalizeStudentLabels(student) {
  return {
    ...student,
    status: normalizeStatusLabel(student.status),
    grade7: normalizeStatusLabel(student.grade7),
    grade8: normalizeStatusLabel(student.grade8),
    grade9: normalizeStatusLabel(student.grade9),
    grade10: normalizeStatusLabel(student.grade10),
    finalStatus: normalizeStatusLabel(student.finalStatus)
  };
}

function getSchoolYears() {
  const saved = localStorage.getItem(SCHOOL_YEARS_KEY);
  if (saved) {
    const years = JSON.parse(saved);
    if (!years.includes("2022-2023")) {
      years.push("2022-2023");
    }
    const sortedYears = sortSchoolYears(years);
    localStorage.setItem(SCHOOL_YEARS_KEY, JSON.stringify(sortedYears));
    return sortedYears;
  }
  const years = sortSchoolYears(["2025-2026", "2024-2025", "2023-2024", "2022-2023"]);
  localStorage.setItem(SCHOOL_YEARS_KEY, JSON.stringify(years));
  return years;
}

function saveSchoolYears(years) {
  localStorage.setItem(SCHOOL_YEARS_KEY, JSON.stringify(sortSchoolYears(years)));
}

function sortSchoolYears(years) {
  return [...new Set(years)].sort((a, b) => Number(String(a).slice(0, 4)) - Number(String(b).slice(0, 4)));
}

function badgeClass(status) {
  if (["Active", "Valid", "Regular", "Enrolled", "Transferred In"].includes(status)) return "bg-success";
  if (["Completed"].includes(status)) return "bg-primary";
  if (["Repeater", "Irregular", "Missing LRN", "Needs Review"].includes(status)) return "bg-warning text-dark";
  if (["Transferred Out", "Dropped", "Dropout", "Dropped Out", "Duplicate LRN"].includes(status)) return "bg-danger";
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

function openStudentForm(student, onSave, defaults = {}) {
  const isEdit = Boolean(student?.lrn);
  const data = student || {
    lrn: "",
    name: "",
    sex: "Female",
    grade: "Grade 7",
    schoolYear: defaults.schoolYear || "2025-2026",
    status: "Enrolled"
  };
  const schoolYears = getSchoolYears();

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
        <label>Year Level
          <select class="form-select" name="grade">
            ${["Grade 7", "Grade 8", "Grade 9", "Grade 10"].map((grade) => `<option ${data.grade === grade ? "selected" : ""}>${grade}</option>`).join("")}
          </select>
        </label>
        <label>School Year
          <select class="form-select" name="schoolYear">
            ${schoolYears.map((year) => `<option ${data.schoolYear === year ? "selected" : ""}>${year}</option>`).join("")}
          </select>
        </label>
        <label>Status
          <select class="form-select" name="status">
            ${["Enrolled", "Repeater", "Dropped Out", "Transferred In", "Transferred Out"].map((status) => `<option ${normalizeStatusLabel(data.status) === status ? "selected" : ""}>${status}</option>`).join("")}
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
      section: data.section || "",
      schoolYear: form.get("schoolYear"),
      status: form.get("status"),
      grade7: data.grade7 || "N/A",
      grade8: data.grade8 || "N/A",
      grade9: data.grade9 || "N/A",
      grade10: data.grade10 || "N/A",
      finalStatus: data.finalStatus || "In Progress"
    };
    const gradeField = gradeFieldName(payload.grade);
    if (gradeField) payload[gradeField] = payload.status;

    if (!/^\d{12}$/.test(payload.lrn)) {
      notify("LRN must be exactly 12 digits.", "error");
      return;
    }

    if (!payload.name || !payload.sex || !payload.grade || !payload.schoolYear || !payload.status) {
      notify("All student fields must be filled out.", "error");
      return;
    }

    delete payload.recordIndex;
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
  const students = getActiveStudents();
  const cards = document.querySelectorAll(".dashboard-card h2");
  if (!cards.length) return;

  const active = students.filter((s) => ["Active", "Enrolled", "Transferred In"].includes(s.status)).length;
  const completed = students.filter((s) => s.status === "Completed" || s.finalStatus === "Regular").length;
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
