const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwHF_p1IpQ1iZunu94plX4HPjpWTQ81SPN37RTjf-5s0bgLhi01KWZKL6zMBoZAsrO1/exec';

const form = document.getElementById('student-form');
const nameInput = document.getElementById('student-name');
const detailsInput = document.getElementById('student-details');
const idInput = document.getElementById('student-id');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const tableBody = document.querySelector('#students-table tbody');

let editing = false;

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function (m) {
    return (
      {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m] || m
    );
  });
}

function renderStudents(students) {
  tableBody.innerHTML = '';
  students.forEach(s => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHTML(s.name)}</td>
      <td>${escapeHTML(s.details)}</td>
      <td>
        <button class="action-btn edit" onclick="editStudent('${s.id}', '${escapeHTML(s.name)}', '${escapeHTML(s.details)}')">Edit</button>
        <button class="action-btn delete" onclick="deleteStudent('${s.id}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

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
