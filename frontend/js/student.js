/**
 * EDUSPHERE STUDENT DASHBOARD CONTROLLER (student.js)
 * Personal student portal for enrolled courses, timetable schedules,
 * direct online class join links, downloadable materials, assignment submission,
 * and academic announcements.
 */

import { API } from './api.js';
import { Auth } from './auth.js';
import { showToast, openModal, closeModal } from './main.js';

export async function initStudentDashboard() {
  // Auth guard: Require STUDENT role
  if (!Auth.requireAuth(['STUDENT'])) return;

  const user = Auth.getUser();
  const studentNameEls = document.querySelectorAll('.student-name-display');
  studentNameEls.forEach(el => el.textContent = user.fullName);

  const studentIdEl = document.getElementById('studentIdDisplay');
  if (studentIdEl) studentIdEl.textContent = user.studentId || 'STU-2026-042';

  // Pane Navigation
  const menuButtons = document.querySelectorAll('[data-student-pane]');
  const panes = document.querySelectorAll('.dashboard-pane');

  menuButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      menuButtons.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const paneId = btn.getAttribute('data-student-pane');
      const targetPane = document.getElementById(paneId);
      if (targetPane) targetPane.classList.add('active');

      const titleEl = document.getElementById('topbarStudentTitle');
      if (titleEl) titleEl.textContent = btn.querySelector('span')?.textContent || 'Student Portal';
    });
  });

  // Mobile sidebar
  const mobileToggle = document.getElementById('studentSidebarToggle');
  const sidebar = document.querySelector('.dashboard-sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Load Data
  await loadStudentSchedule();
  await loadEnrolledCourses();
  await loadStudentMaterials();
  await loadStudentAssignments();
  await loadStudentAnnouncements();
  setupAssignmentSubmission();
}

// 1. Today's Classes & Online Join Links
async function loadStudentSchedule() {
  const container = document.getElementById('studentScheduleList');
  if (!container) return;

  const schedules = await API.getSchedules();

  if (schedules.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">☕</div>
        <h3>No Classes Scheduled Today</h3>
        <p>You have no pending live classes scheduled for today. Check back later or review study notes.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = schedules.map(s => {
    const isOnline = s.mode === 'Online';
    const actionBtn = isOnline && s.meetingUrl ? `
      <a href="${s.meetingUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        Join Google Meet
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
            <span>👨‍🏫 ${s.teacherName}</span>
            <span>🏛️ ${s.batchName}</span>
          </div>
        </div>
        <div>
          ${actionBtn}
        </div>
      </div>
    `;
  }).join('');
}

// 2. Enrolled Courses
async function loadEnrolledCourses() {
  const container = document.getElementById('studentCoursesList');
  if (!container) return;

  const courses = await API.getCourses();
  const enrolled = courses.slice(0, 2); // Show top 2 active enrollments for demo student

  container.innerHTML = enrolled.map(c => `
    <div class="card" style="margin-bottom:1.5rem;padding:1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1.5rem;">
      <div style="max-width:550px;">
        <span class="badge badge-primary" style="margin-bottom:0.5rem;">Enrolled • Active</span>
        <h3 style="font-size:1.25rem;margin-bottom:0.35rem;">${c.title}</h3>
        <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:0.85rem;">Instructor: ${c.teacher}</p>
        <div style="background:var(--bg-subtle);border-radius:var(--radius-full);height:8px;width:100%;max-width:300px;overflow:hidden;">
          <div style="background:var(--primary);width:68%;height:100%;border-radius:var(--radius-full);"></div>
        </div>
        <span style="font-size:0.75rem;color:var(--text-muted);margin-top:0.35rem;display:block;">Syllabus Progress: 68% Completed</span>
      </div>
      <div class="btn-group">
        <a href="course-details.html?id=${c.id}" class="btn btn-outline btn-sm">Syllabus</a>
      </div>
    </div>
  `).join('');
}

// 3. Downloadable Study Materials
async function loadStudentMaterials() {
  const container = document.getElementById('studentMaterialsList');
  if (!container) return;

  const materials = await API.getMaterials();
  container.innerHTML = materials.map(m => `
    <div class="material-item-card">
      <div style="display:flex;align-items:center;gap:1.25rem;">
        <div class="material-icon-pill">${m.fileType}</div>
        <div>
          <h4 style="font-size:1.05rem;margin-bottom:0.25rem;">${m.title}</h4>
          <p style="font-size:0.85rem;color:var(--text-muted);">${m.courseName} • Uploaded by ${m.uploadedBy} on ${m.uploadedDate}</p>
        </div>
      </div>
      <a href="#" class="btn btn-sm btn-outline-primary" onclick="alert('Downloading ${m.title} (${m.size})'); return false;">
        Download (${m.size})
      </a>
    </div>
  `).join('');
}

// 4. Assignments & Submission System
let activeAssignmentId = null;

async function loadStudentAssignments() {
  const container = document.getElementById('studentAssignmentsList');
  if (!container) return;

  const assignments = await API.getAssignments();
  container.innerHTML = assignments.map(a => {
    const isSubmitted = a.status === 'Submitted';
    const statusBadge = isSubmitted ? 'badge-success' : 'badge-warning';

    const actionArea = isSubmitted ? `
      <div style="text-align:right;">
        <span class="badge badge-success" style="margin-bottom:0.4rem;">Grade: ${a.mySubmission?.grade || 'Evaluated'}</span>
        <p style="font-size:0.8rem;color:var(--text-muted);max-width:240px;">${a.mySubmission?.remarks || 'Submitted'}</p>
      </div>
    ` : `
      <button class="btn btn-sm btn-primary submit-assign-btn" data-id="${a.id}" data-title="${a.title}">
        Submit Assignment
      </button>
    `;

    return `
      <div class="assignment-item-card">
        <div>
          <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.35rem;">
            <span class="badge ${statusBadge}">${a.status}</span>
            <span style="font-size:0.8rem;color:var(--danger);font-weight:600;">Due: ${a.dueDate}</span>
          </div>
          <h4 style="font-size:1.08rem;margin-bottom:0.35rem;">${a.title}</h4>
          <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:0.5rem;">${a.instructions}</p>
          <span style="font-size:0.8rem;color:var(--text-muted);">Course: ${a.courseName} • Max Marks: ${a.maxMarks}</span>
        </div>
        <div>
          ${actionArea}
        </div>
      </div>
    `;
  }).join('');

  // Attach submit listeners
  container.querySelectorAll('.submit-assign-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeAssignmentId = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      const titleEl = document.getElementById('modalAssignmentTitle');
      if (titleEl) titleEl.textContent = title;
      openModal('assignmentSubmitModal');
    });
  });
}

function setupAssignmentSubmission() {
  const form = document.getElementById('assignmentSubmitForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeAssignmentId) return;

    const fileInput = document.getElementById('assignmentFile');
    const notesInput = document.getElementById('assignmentNotes');

    const fileName = fileInput.files[0]?.name || 'student_solution.pdf';
    const notes = notesInput.value.trim();

    try {
      await API.submitAssignment(activeAssignmentId, { fileName, notes });
      showToast('Assignment Submitted Successfully!', 'Your submission was recorded for teacher review.', 'success');
      form.reset();
      closeModal('assignmentSubmitModal');
      await loadStudentAssignments();
    } catch (err) {
      showToast('Error Submitting Assignment', err.message, 'error');
    }
  });
}

// 5. Announcements
async function loadStudentAnnouncements() {
  const container = document.getElementById('studentAnnouncementsList');
  if (!container) return;

  const anns = await API.getAnnouncements();
  container.innerHTML = anns.map(a => `
    <div class="card" style="margin-bottom:1rem;padding:1.25rem 1.5rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
        <span class="badge badge-primary">${a.target}</span>
        <span style="font-size:0.8rem;color:var(--text-muted);">${a.date}</span>
      </div>
      <h4 style="font-size:1.1rem;margin-bottom:0.35rem;">${a.title}</h4>
      <p style="font-size:0.9rem;color:var(--text-muted);line-height:1.5;">${a.content}</p>
      <span style="font-size:0.75rem;color:var(--text-light);margin-top:0.5rem;display:block;">From: ${a.author}</span>
    </div>
  `).join('');
}
