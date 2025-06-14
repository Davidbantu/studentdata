// ==== CONFIGURATION ====
// Replace this with your deployed Google Apps Script URL (see setup instructions below)
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby_7xxxOpgXZCgTYJUbEJhDRwBxg_qgtQ6bURh-r-u7wysi8FqT76c8blmMkiplZx_V/exec';

// If you want to show a link to your Google Sheet, paste it here (optional)
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1jZBil8Qi6EzKv57_smc552I-a8VrijA54e6A6JeT7-Y/edit?gid=0#gid=0';

// ==== APP LOGIC ====

const form = document.getElementById('student-form');
const nameInput = document.getElementById('student-name');
const detailsInput = document.getElementById('student-details');
const idInput = document.getElementById('student-id');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const tableBody = document.querySelector('#students-table tbody');
const gsheetUrl = document.getElementById('gsheet-url');

if (GOOGLE_SHEET_URL) {
  gsheetUrl.href = GOOGLE_SHEET_URL;
} else {
  gsheetUrl.parentNode.style.display = 'none';
}

let editing = false;

function renderStudents(students) {
  tableBody.innerHTML = '';
  students.forEach(s => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${s.name}</td>
      <td>${s.details}</td>
      <td>
        <button class="action-btn edit" onclick="editStudent('${s.id}', '${s.name}', '${s.details}')">Edit</button>
        <button class="action-btn delete" onclick="deleteStudent('${s.id}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Expose for inline HTML handlers
window.editStudent = (id, name, details) => {
  nameInput.value = name;
  detailsInput.value = details;
  idInput.value = id;
  editing = true;
  submitBtn.textContent = 'Update';
  cancelBtn.style.display = 'inline-block';
};

window.deleteStudent = async (id) => {
  if (confirm('Are you sure you want to delete this student?')) {
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', id }),
      headers: { 'Content-Type': 'application/json' }
    });
    loadStudents();
  }
};

cancelBtn.onclick = () => {
  form.reset();
  idInput.value = '';
  editing = false;
  submitBtn.textContent = 'Add Student';
  cancelBtn.style.display = 'none';
};

form.onsubmit = async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const details = detailsInput.value.trim();
  const id = idInput.value;
  if (!name || !details) return;

  if (editing) {
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'edit', id, name, details }),
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'add', name, details }),
      headers: { 'Content-Type': 'application/json' }
    });
  }
  form.reset();
  editing = false;
  idInput.value = '';
  submitBtn.textContent = 'Add Student';
  cancelBtn.style.display = 'none';
  loadStudents();
};

async function loadStudents() {
  const res = await fetch(GOOGLE_APPS_SCRIPT_URL);
  const students = await res.json();
  renderStudents(students);
}

loadStudents();
