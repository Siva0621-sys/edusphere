/**
 * EDUSPHERE AUTHENTICATION SERVICE (auth.js)
 * Handles token sessions, credentials validation, RBAC guards, and demo accounts.
 */

import { API } from './api.js';

// Pre-seeded demo credentials for instant evaluation
const DEMO_USERS = [
  {
    id: 'usr-admin-1',
    email: 'admin@edusphere.edu',
    fullName: 'Chief Administrator',
    role: 'ADMIN',
    avatar: 'CA',
    token: 'jwt_mock_admin_token_xyz123'
  },
  {
    id: 'usr-teach-1',
    email: 'sharma@edusphere.edu',
    fullName: 'Dr. Ramesh Sharma',
    role: 'TEACHER',
    avatar: 'RS',
    token: 'jwt_mock_teacher_token_abc456'
  },
  {
    id: 'usr-stud-1',
    email: 'rahul@edusphere.edu',
    fullName: 'Rahul Deshmukh',
    studentId: 'STU-2026-042',
    role: 'STUDENT',
    avatar: 'RD',
    token: 'jwt_mock_student_token_def789'
  }
];

export const Auth = {
  // Get currently logged-in user
  getUser() {
    try {
      const raw = localStorage.getItem('edusphere_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  // Check if authenticated
  isAuthenticated() {
    return !!this.getUser() && !!localStorage.getItem('edusphere_token');
  },

  // Login handler
  async login(email, password, expectedRole = null) {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try real backend API if reachable
    try {
      const res = await API.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password })
      });
      if (res && res.token && res.user) {
        localStorage.setItem('edusphere_token', res.token);
        localStorage.setItem('edusphere_user', JSON.stringify(res.user));
        return res.user;
      }
    } catch (err) {
      console.warn('Backend login endpoint unavailable, attempting local authentication.', err.message);
    }

    // 2. Demo accounts validation
    const demo = DEMO_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (demo) {
      // Basic mock check: accepts valid demo passwords
      if (password === 'Admin@123' || password === 'Teacher@123' || password === 'Student@123' || password.length >= 6) {
        localStorage.setItem('edusphere_token', demo.token);
        localStorage.setItem('edusphere_user', JSON.stringify(demo));
        return demo;
      } else {
        throw new Error('Invalid credentials. Please verify your password.');
      }
    }

    // 3. Fallback for registered students
    const localUsers = JSON.parse(localStorage.getItem('edusphere_registered_users') || '[]');
    const registered = localUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (registered) {
      if (registered.password === password) {
        const userObj = {
          id: registered.id,
          email: registered.email,
          fullName: registered.fullName,
          studentId: registered.studentId || 'STU-NEW',
          role: registered.role || 'STUDENT',
          avatar: registered.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        };
        localStorage.setItem('edusphere_token', 'jwt_mock_' + registered.id);
        localStorage.setItem('edusphere_user', JSON.stringify(userObj));
        return userObj;
      } else {
        throw new Error('Incorrect password.');
      }
    }

    throw new Error('No user account found with this email address.');
  },

  // Registration handler
  async register(registrationData) {
    // 1. Try backend API
    try {
      const res = await API.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(registrationData)
      });
      if (res && res.user) {
        localStorage.setItem('edusphere_token', res.token);
        localStorage.setItem('edusphere_user', JSON.stringify(res.user));
        return res.user;
      }
    } catch (err) {
      console.warn('Backend register endpoint unavailable, saving locally.', err.message);
    }

    // 2. Local registration fallback
    const localUsers = JSON.parse(localStorage.getItem('edusphere_registered_users') || '[]');
    if (localUsers.some(u => u.email.toLowerCase() === registrationData.email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      id: 'usr-reg-' + Date.now(),
      studentId: 'STU-' + Math.floor(1000 + Math.random() * 9000),
      ...registrationData,
      role: 'STUDENT',
      createdAt: new Date().toISOString()
    };

    localUsers.push(newUser);
    localStorage.setItem('edusphere_registered_users', JSON.stringify(localUsers));

    const userObj = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      studentId: newUser.studentId,
      role: 'STUDENT',
      avatar: newUser.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    };

    localStorage.setItem('edusphere_token', 'jwt_mock_' + newUser.id);
    localStorage.setItem('edusphere_user', JSON.stringify(userObj));
    return userObj;
  },

  // Logout
  logout() {
    localStorage.removeItem('edusphere_token');
    localStorage.removeItem('edusphere_user');
    window.location.href = 'login.html';
  },

  // Role Guard for Protected Dashboard Pages
  requireAuth(allowedRoles = []) {
    const user = this.getUser();
    if (!user) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return false;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      alert(`Unauthorized Access. Your role (${user.role}) cannot access this portal.`);
      // Redirect to authorized portal
      if (user.role === 'ADMIN') window.location.href = 'admin-dashboard.html';
      else if (user.role === 'TEACHER') window.location.href = 'teacher-dashboard.html';
      else window.location.href = 'student-dashboard.html';
      return false;
    }

    return true;
  }
};
