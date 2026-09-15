/**
 * EDUSPHERE COURSES MODULE (courses.js)
 * Manages course listings, dynamic search, multi-filters, sorting, and detail page rendering.
 */

import { API } from './api.js';

// Render Course Card HTML
export function createCourseCard(course) {
  const modeBadgeClass = course.mode === 'Online' ? 'badge-primary' : (course.mode === 'Offline' ? 'badge-warning' : 'badge-info');
  
  return `
    <div class="card card-hover course-card" data-course-id="${course.id}">
      <div class="course-card-image">
        <div class="course-card-image-bg"></div>
        <svg class="course-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
        <span class="badge ${modeBadgeClass} course-mode-badge">${course.mode}</span>
        <span class="badge course-grade-badge">${course.classGrade}</span>
      </div>
      <div class="course-card-body">
        <span class="course-subject">${course.subject}</span>
        <h3 class="course-title">${course.title}</h3>
        <p class="course-desc">${course.description}</p>
        <div class="course-meta">
          <div class="course-meta-item">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            ${course.duration}
          </div>
          <div class="course-meta-item">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            ${course.teacher ? course.teacher.split('(')[0].trim() : 'Expert Faculty'}
          </div>
        </div>
      </div>
      <div class="course-footer">
        <div class="course-price">
          <span class="course-fee-label">Tuition Fee</span>
          <span class="course-fee-amount">₹${course.fee.toLocaleString()} <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted);">/mo</span></span>
        </div>
        <div class="btn-group">
          <a href="course-details.html?id=${course.id}" class="btn btn-sm btn-outline">Details</a>
          <a href="admission.html?course=${encodeURIComponent(course.id)}" class="btn btn-sm btn-primary">Apply</a>
        </div>
      </div>
    </div>
  `;
}

// Initialize Course Catalog Page (courses.html)
export async function initCoursesCatalog() {
  const coursesContainer = document.getElementById('coursesContainer');
  if (!coursesContainer) return;

  const searchInput = document.getElementById('courseSearch');
  const classFilter = document.getElementById('filterClass');
  const subjectFilter = document.getElementById('filterSubject');
  const modeFilter = document.getElementById('filterMode');
  const sortSelect = document.getElementById('sortCourses');
  const countBadge = document.getElementById('courseCountBadge');

  let allCourses = await API.getCourses();

  function renderFiltered() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedClass = classFilter ? classFilter.value : '';
    const selectedSubject = subjectFilter ? subjectFilter.value : '';
    const selectedMode = modeFilter ? modeFilter.value : '';
    const sortBy = sortSelect ? sortSelect.value : 'popular';

    let filtered = allCourses.filter(c => {
      const matchQuery = !query || 
        c.title.toLowerCase().includes(query) || 
        c.subject.toLowerCase().includes(query) || 
        c.description.toLowerCase().includes(query);
      const matchClass = !selectedClass || c.classGrade.includes(selectedClass);
      const matchSubject = !selectedSubject || c.subject.toLowerCase().includes(selectedSubject.toLowerCase());
      const matchMode = !selectedMode || c.mode.toLowerCase() === selectedMode.toLowerCase();

      return matchQuery && matchClass && matchSubject && matchMode;
    });

    // Sorting
    if (sortBy === 'fee-low') {
      filtered.sort((a, b) => a.fee - b.fee);
    } else if (sortBy === 'fee-high') {
      filtered.sort((a, b) => b.fee - a.fee);
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (countBadge) {
      countBadge.textContent = `${filtered.length} courses available`;
    }

    if (filtered.length === 0) {
      coursesContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🔍</div>
          <h3>No Courses Found</h3>
          <p>We couldn't find any courses matching your selected criteria. Try adjusting your filters or search keywords.</p>
          <button id="resetFiltersBtn" class="btn btn-outline-primary btn-sm">Reset All Filters</button>
        </div>
      `;
      document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (classFilter) classFilter.value = '';
        if (subjectFilter) subjectFilter.value = '';
        if (modeFilter) modeFilter.value = '';
        renderFiltered();
      });
      return;
    }

    coursesContainer.innerHTML = filtered.map(createCourseCard).join('');
  }

  // Event Listeners
  if (searchInput) searchInput.addEventListener('input', renderFiltered);
  if (classFilter) classFilter.addEventListener('change', renderFiltered);
  if (subjectFilter) subjectFilter.addEventListener('change', renderFiltered);
  if (modeFilter) modeFilter.addEventListener('change', renderFiltered);
  if (sortSelect) sortSelect.addEventListener('change', renderFiltered);

  renderFiltered();
}

// Initialize Course Details Page (course-details.html)
export async function initCourseDetails() {
  const detailsWrap = document.getElementById('courseDetailsWrapper');
  if (!detailsWrap) return;

  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id') || 'course-1';

  const course = await API.getCourseById(courseId);

  if (!course) {
    detailsWrap.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Course Not Found</h3>
        <p>The requested course profile could not be located or has been archived.</p>
        <a href="courses.html" class="btn btn-primary">Browse All Courses</a>
      </div>
    `;
    return;
  }

  // Update Page Meta & Breadcrumb
  document.title = `${course.title} | EduSphere`;
  const breadcrumbCourseName = document.getElementById('breadcrumbCourse');
  if (breadcrumbCourseName) breadcrumbCourseName.textContent = course.title;

  const modeBadgeClass = course.mode === 'Online' ? 'badge-primary' : (course.mode === 'Offline' ? 'badge-warning' : 'badge-info');

  const syllabusHtml = course.syllabus ? course.syllabus.map(s => `
    <div style="background:var(--bg-subtle);padding:1.25rem 1.5rem;border-radius:var(--radius-md);margin-bottom:1rem;border-left:4px solid var(--primary);">
      <h4 style="font-size:1.05rem;margin-bottom:0.35rem;">${s.unit}</h4>
      <p style="color:var(--text-muted);font-size:0.92rem;">${s.topics}</p>
    </div>
  `).join('') : '<p class="text-muted">Detailed syllabus outline provided upon enrollment.</p>';

  detailsWrap.innerHTML = `
    <div class="grid-3" style="grid-template-columns: 2fr 1fr; gap: 2.5rem;">
      <div>
        <div style="display:flex;gap:0.75rem;margin-bottom:1rem;flex-wrap:wrap;">
          <span class="badge ${modeBadgeClass}">${course.mode} Learning</span>
          <span class="badge badge-neutral">${course.classGrade}</span>
          <span class="badge badge-neutral">${course.subject}</span>
        </div>
        <h1 style="font-size:2.5rem;line-height:1.2;margin-bottom:1.25rem;">${course.title}</h1>
        <p style="font-size:1.15rem;color:var(--text-muted);line-height:1.7;margin-bottom:2.5rem;">${course.description}</p>

        <h3 style="font-size:1.45rem;margin-bottom:1.25rem;border-bottom:1px solid var(--border-color);padding-bottom:0.75rem;">Syllabus Overview & Learning Modules</h3>
        <div style="margin-bottom:2.5rem;">
          ${syllabusHtml}
        </div>

        <h3 style="font-size:1.45rem;margin-bottom:1.25rem;border-bottom:1px solid var(--border-color);padding-bottom:0.75rem;">Faculty & Mentorship</h3>
        <div class="card" style="display:flex;gap:1.5rem;padding:1.5rem;margin-bottom:2.5rem;align-items:center;">
          <div style="width:64px;height:64px;border-radius:var(--radius-full);background:var(--primary-light);color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.5rem;flex-shrink:0;">
            ${course.teacher ? course.teacher[0] : 'T'}
          </div>
          <div>
            <h4 style="font-size:1.15rem;margin-bottom:0.25rem;">${course.teacher || 'Senior Faculty Panel'}</h4>
            <p style="color:var(--text-muted);font-size:0.88rem;">Dedicated Lead Instructor • EduSphere Academic Board</p>
          </div>
        </div>

        <h3 style="font-size:1.45rem;margin-bottom:1.25rem;border-bottom:1px solid var(--border-color);padding-bottom:0.75rem;">Admission Requirements</h3>
        <ul style="list-style:disc;padding-left:1.5rem;color:var(--text-muted);line-height:1.8;margin-bottom:2rem;">
          <li>Valid school enrollment in the respective class / grade.</li>
          <li>Previous academic mark sheet / report card for counseling assessment.</li>
          <li>For Online & Hybrid modes: Stable internet connection and smartphone / laptop / tablet.</li>
        </ul>
      </div>

      <!-- Sticky Enrollment Sidebar -->
      <div>
        <div class="card" style="position:sticky;top:calc(var(--header-height) + 1.5rem);box-shadow:var(--shadow-lg);">
          <div class="card-body">
            <div style="margin-bottom:1.5rem;">
              <span class="course-fee-label">Monthly Tuition Fee</span>
              <div style="font-size:2.2rem;font-weight:800;font-family:var(--font-heading);color:var(--text-main);">
                ₹${course.fee.toLocaleString()}
                <span style="font-size:0.95rem;font-weight:500;color:var(--text-muted);">/month</span>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:2rem;font-size:0.92rem;color:var(--text-main);">
              <div style="display:flex;align-items:center;gap:0.75rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border-color);">
                <span style="color:var(--primary);">🗓️</span>
                <div><strong>Duration:</strong> ${course.duration}</div>
              </div>
              <div style="display:flex;align-items:center;gap:0.75rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border-color);">
                <span style="color:var(--primary);">⏰</span>
                <div><strong>Timings:</strong> ${course.timings}</div>
              </div>
              <div style="display:flex;align-items:center;gap:0.75rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border-color);">
                <span style="color:var(--primary);">👥</span>
                <div><strong>Seats Available:</strong> ${course.seatsAvailable || 8} / ${course.maxSeats || 25}</div>
              </div>
              <div style="display:flex;align-items:center;gap:0.75rem;">
                <span style="color:var(--primary);">🏫</span>
                <div><strong>Mode:</strong> ${course.mode} Classroom</div>
              </div>
            </div>

            <a href="admission.html?course=${encodeURIComponent(course.id)}" class="btn btn-primary btn-block btn-lg" style="margin-bottom:0.75rem;">
              Apply for Admission
            </a>
            <a href="contact.html?inquiry=${encodeURIComponent(course.title)}" class="btn btn-outline btn-block">
              Request Free Counseling Call
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}
