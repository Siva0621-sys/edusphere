/**
 * EDUSPHERE GLOBAL SCRIPT (main.js)
 * Controls navigation, mobile drawer, toasts, modals, and dynamic institute branding.
 */

import { API } from './api.js';
import { Auth } from './auth.js';

// Global Toast Manager
export function showToast(title, message = '', type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div style="flex-grow: 1;">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:1.1rem;line-height:1;" aria-label="Close">&times;</button>
  `;

  // Close on click
  toast.querySelector('button').addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  });

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto remove after 4.5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }
  }, 4500);
}

// Global Modal Helpers
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Apply Configurable Institute Branding to the DOM
export function applyInstituteBranding() {
  const branding = API.getBrandingConfig();

  // Institute Name
  document.querySelectorAll('.institute-name').forEach(el => {
    el.textContent = branding.name;
  });

  // Institute Tagline
  document.querySelectorAll('.institute-tagline').forEach(el => {
    el.textContent = branding.tagline;
  });

  // Contact Info
  document.querySelectorAll('.institute-phone').forEach(el => {
    el.textContent = branding.phone;
    if (el.tagName === 'A') el.href = `tel:${branding.phone.replace(/[^+\d]/g, '')}`;
  });

  document.querySelectorAll('.institute-whatsapp').forEach(el => {
    el.textContent = branding.whatsapp;
    if (el.tagName === 'A') el.href = `https://wa.me/${branding.whatsapp.replace(/[^+\d]/g, '')}`;
  });

  document.querySelectorAll('.institute-email').forEach(el => {
    el.textContent = branding.email;
    if (el.tagName === 'A') el.href = `mailto:${branding.email}`;
  });

  document.querySelectorAll('.institute-address').forEach(el => {
    el.textContent = branding.address;
  });

  document.querySelectorAll('.institute-hours').forEach(el => {
    el.textContent = branding.workingHours;
  });

  // Theme primary color
  if (branding.primaryColor) {
    document.documentElement.style.setProperty('--primary', branding.primaryColor);
  }
}

// Update Navbar Authentication State
export function updateNavAuthState() {
  const user = Auth.getUser();
  const authContainer = document.querySelector('.nav-auth-container');
  if (!authContainer) return;

  if (user) {
    let dashboardLink = 'student-dashboard.html';
    if (user.role === 'ADMIN') dashboardLink = 'admin-dashboard.html';
    else if (user.role === 'TEACHER') dashboardLink = 'teacher-dashboard.html';

    authContainer.innerHTML = `
      <a href="${dashboardLink}" class="btn btn-outline-primary btn-sm">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        ${user.fullName.split(' ')[0]} (${user.role})
      </a>
      <button id="navLogoutBtn" class="btn btn-sm btn-outline" style="border:none;color:var(--text-muted);">Logout</button>
    `;

    document.getElementById('navLogoutBtn')?.addEventListener('click', () => {
      Auth.logout();
    });
  } else {
    authContainer.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-sm">Login</a>
      <a href="admission.html" class="btn btn-primary btn-sm">Apply Now</a>
    `;
  }
}

// Initialize Global Elements on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  applyInstituteBranding();
  updateNavAuthState();

  // Highlight Active Link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Mobile Menu Drawer Toggle
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
      mobileToggle.innerHTML = mobileDrawer.classList.contains('open') ? '&times;' : '&#9776;';
    });
  }

  // Close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Modal close buttons
  document.querySelectorAll('.modal-close, [data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
});
