document.addEventListener("DOMContentLoaded", () => {
  getStudents();
  updateSummaryCards();
  onStudentDataChanged(updateSummaryCards);
});
