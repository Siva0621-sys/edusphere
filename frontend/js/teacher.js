/**
 * EDUSPHERE TEACHER DASHBOARD CONTROLLER (teacher.js)
 * Teacher portal for managing assigned batches, launching online classes (Google Meet/Zoom),
 * uploading study materials, creating assignments, reviewing student submissions,
 * and publishing batch notices.
 */

import { API } from './api.js';
import { Auth } from './auth.js';
import { showToast, openModal, closeModal } from './main.js';

export async function initTeacherDashboard() {
  // Auth guard: Require TEACHER role
  if (!Auth.requireAuth(['TEACHER'])) return;

  const user = Auth.getUser();
  const teacherNameEls = document.querySelectorAll('.teacher-name-display');
  teacherNameEls.forEach(el => el.textContent = user.fullName);

  // Pane Navigation
  const menuButtons = document.querySelectorAll('[data-teacher-pane]');
  const panes = document.querySelectorAll('.dashboard-pane');

  menuButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      menuButtons.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const paneId = btn.getAttribute('data-teacher-pane');
      const targetPane = document.getElementById(paneId);
      if (targetPane) targetPane.classList.add('active');

      const titleEl = document.getElementById('topbarTeacherTitle');
      if (titleEl) titleEl.textContent = btn.querySelector('span')?.textContent || 'Teacher Portal';
    });
  });

  // Mobile sidebar toggle
  const mobileToggle = document.getElementById('teacherSidebarToggle');
  const sidebar = document.querySelector('.dashboard-sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Load Data
  await loadTeacherClasses();
  await loadTeacherMaterials();
  await loadTeacherAssignments();
  setupCreateClassModal();
  setupUploadMaterialModal();
  setupCreateAssignmentModal();
}

// 1. Teacher Schedule & Online Class Launcher
async function loadTeacherClasses() {
  const container = document.getElementById('teacherClassesList');
  if (!container) return;

  const schedules = await API.getSchedules();

  container.innerHTML = schedules.map(s => {
    const isOnline = s.mode === 'Online';
    const actionBtn = isOnline ? `
      <a href="${s.meetingUrl || 'https://meet.google.com/new'}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        Launch Class
      </a>
    ` : `
      <span class="badge badge-warning" style="font-size:0.9rem;padding:0.5rem 1rem;">
        Offline: ${s.platform || 'Room 102'}
      </span>
    `;

    return `
      <div class="class-schedule-card">
        <div class="class-time-block">
          <span class="class-time">${s.time}</span>
          <span class="class-duration">${s.date}</span>
        </div>
        <div class="class-detail-block">
          <h4>${s.topic}</h4>
          <div class="class-detail-meta">
            <span>📚 <strong>${s.subject}</strong></span>
            <span>🏛️ ${s.batchName}</span>
            <span>🌐 Mode: ${s.mode}</span>
          </div>
        </div>
        <div>
          ${actionBtn}
        </div>
      </div>
    `;
  }).join('');
}

function setupCreateClassModal() {
  const form = document.getElementById('createClassForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const user = Auth.getUser();
    const payload = {
      subject: formData.get('classSubject'),
      topic: formData.get('classTopic'),
      batchName: formData.get('classBatch') || 'Batch 10-A',
      courseName: 'Tuition Program',
      teacherName: user.fullName,
      date: formData.get('classDate') || 'Today',
      time: formData.get('classTime') || '05:00 PM - 06:30 PM',
      mode: formData.get('classMode') || 'Online',
      meetingUrl: formData.get('classMeetingUrl') || 'https://meet.google.com/edu-sph-live',
      platform: formData.get('classPlatform') || 'Google Meet'
    };

    try {
      await API.createSchedule(payload);
      showToast('Class Scheduled Successfully!', payload.topic, 'success');
      form.reset();
      closeModal('createClassModal');
      await loadTeacherClasses();
    } catch (err) {
      showToast('Scheduling Failed', err.message, 'error');
    }
  });
}

// 2. Teacher Study Materials
async function loadTeacherMaterials() {
  const container = document.getElementById('teacherMaterialsList');
  if (!container) return;

  const materials = await API.getMaterials();
  container.innerHTML = materials.map(m => `
    <div class="material-item-card">
      <div style="display:flex;align-items:center;gap:1.25rem;">
        <div class="material-icon-pill">${m.fileType}</div>
        <div>
          <h4 style="font-size:1.05rem;margin-bottom:0.25rem;">${m.title}</h4>
          <p style="font-size:0.85rem;color:var(--text-muted);">${m.courseName} • Subject: ${m.subject} • Date: ${m.uploadedDate}</p>
        </div>
      </div>
      <span class="badge badge-success">Published</span>
    </div>
  `).join('');
}

function setupUploadMaterialModal() {
  const form = document.getElementById('uploadMaterialForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const user = Auth.getUser();

    const fileInput = document.getElementById('materialFileInput');
    const fileName = fileInput.files[0]?.name || 'StudyNotes.pdf';
    const ext = fileName.split('.').pop().toUpperCase();

    const payload = {
      title: formData.get('matTitle'),
      subject: formData.get('matSubject') || 'General Science',
      courseName: formData.get('matCourse') || 'Tuition Course',
      fileType: ext || 'PDF',
      size: '2.5 MB',
      uploadedBy: user.fullName
    };

    try {
      await API.uploadMaterial(payload);
      showToast('Material Uploaded', payload.title, 'success');
      form.reset();
      closeModal('uploadMaterialModal');
      await loadTeacherMaterials();
    } catch (err) {
      showToast('Upload Failed', err.message, 'error');
    }
  });
}

// 3. Teacher Assignments
async function loadTeacherAssignments() {
  const container = document.getElementById('teacherAssignmentsList');
  if (!container) return;

  const assignments = await API.getAssignments();
  container.innerHTML = assignments.map(a => `
    <div class="assignment-item-card">
      <div>
        <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.35rem;">
          <span class="badge badge-primary">Active Assignment</span>
          <span style="font-size:0.8rem;color:var(--danger);font-weight:600;">Due Date: ${a.dueDate}</span>
        </div>
        <h4 style="font-size:1.08rem;margin-bottom:0.35rem;">${a.title}</h4>
        <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:0.5rem;">${a.instructions}</p>
        <span style="font-size:0.8rem;color:var(--text-muted);">Max Marks: ${a.maxMarks}</span>
      </div>
      <div class="btn-group">
        <button class="btn btn-sm btn-outline-primary" onclick="alert('Submission review: 18 students submitted, 4 pending.');">
          View Submissions (18)
        </button>
      </div>
    </div>
  `).join('');
}

function setupCreateAssignmentModal() {
  const form = document.getElementById('createAssignmentForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const user = Auth.getUser();

    const payload = {
      title: formData.get('assignTitle'),
      instructions: formData.get('assignInstructions'),
      courseName: formData.get('assignCourse') || 'Class 10 CBSE Board Mastery',
      dueDate: formData.get('assignDueDate'),
      maxMarks: parseInt(formData.get('assignMaxMarks'), 10) || 25,
      teacherName: user.fullName
    };

    try {
      await API.createAssignment(payload);
      showToast('Assignment Created', payload.title, 'success');
      form.reset();
      closeModal('createAssignmentModal');
      await loadTeacherAssignments();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  });
}
