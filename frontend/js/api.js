/**
 * EDUSPHERE API CLIENT (api.js)
 * High-reliability dual-mode client:
 * Connects to Express REST API (/api/*) when online, and gracefully falls back
 * to a local reactive mock storage so the entire application is 100% interactive
 * even before the backend server is started.
 */

const API_BASE = 'http://localhost:5000/api';

// Initial Mock Dataset for Phase 1 Frontend Foundation
const DEFAULT_COURSES = [
  {
    id: 'course-1',
    title: 'Class 10 CBSE Comprehensive Board Mastery',
    slug: 'cbse-class-10-mastery',
    classGrade: 'Class 10',
    subject: 'Science & Mathematics',
    description: 'Complete syllabus coverage with intensive practice, NCERT exemplar problem solving, weekly tests, and CBSE board exam question bank mastery.',
    duration: '10 Months',
    mode: 'Hybrid',
    teacher: 'Dr. Ramesh Sharma (Ph.D. Physics)',
    timings: 'Mon, Wed, Fri (5:00 PM - 7:00 PM)',
    fee: 3500,
    feeType: 'per month',
    seatsAvailable: 8,
    maxSeats: 25,
    syllabus: [
      { unit: 'Physics', topics: 'Light, Electricity, Magnetic Effects of Electric Current' },
      { unit: 'Chemistry', topics: 'Chemical Reactions, Acids & Bases, Metals & Non-metals, Carbon Compounds' },
      { unit: 'Mathematics', topics: 'Real Numbers, Polynomials, Quadratic Equations, Triangles, Trigonometry' }
    ]
  },
  {
    id: 'course-2',
    title: 'Class 12 Physics & Chemistry Excellence (JEE / NEET Prep)',
    slug: 'class-12-physics-chem-excellence',
    classGrade: 'Class 12',
    subject: 'Physics & Chemistry',
    description: 'Rigorous conceptual foundation and numerical solving techniques tailored for both CBSE board exams and competitive entrance examinations.',
    duration: '1 Year',
    mode: 'Online',
    teacher: 'Prof. Priya Verma (M.Sc. Chemistry, 12+ Yrs Exp)',
    timings: 'Tue, Thu, Sat (6:00 PM - 8:00 PM)',
    fee: 4500,
    feeType: 'per month',
    seatsAvailable: 5,
    maxSeats: 20,
    syllabus: [
      { unit: 'Physics (Part 1)', topics: 'Electrostatics, Current Electricity, Magnetism, Optics' },
      { unit: 'Physical Chemistry', topics: 'Solutions, Electrochemistry, Chemical Kinetics' },
      { unit: 'Organic Chemistry', topics: 'Haloalkanes, Alcohols, Aldehydes, Ketones, Amines' }
    ]
  },
  {
    id: 'course-3',
    title: 'Class 9 Foundation Builder in Mathematics & Science',
    slug: 'class-9-foundation-builder',
    classGrade: 'Class 9',
    subject: 'Maths & Science',
    description: 'Strong foundation building for high school success with hands-on conceptual animations, doubt clearing, and regular chapter-wise quizzes.',
    duration: '10 Months',
    mode: 'Offline',
    teacher: 'Vikram Joshi (B.Tech IIT Roorkee)',
    timings: 'Mon, Wed, Fri (4:00 PM - 5:30 PM)',
    fee: 3000,
    feeType: 'per month',
    seatsAvailable: 12,
    maxSeats: 30,
    syllabus: [
      { unit: 'Maths', topics: 'Number Systems, Coordinate Geometry, Linear Equations, Lines and Angles' },
      { unit: 'Science', topics: 'Matter in Our Surroundings, Cell Biology, Force and Laws of Motion, Gravitation' }
    ]
  },
  {
    id: 'course-4',
    title: 'Class 11 & 12 Computer Science (Python & SQL)',
    slug: 'class-11-12-computer-science',
    classGrade: 'Class 11 & 12',
    subject: 'Computer Science',
    description: 'Hands-on programming mastery in Python, Object Oriented concepts, Data Structures, SQL databases, and practical project guidance.',
    duration: '8 Months',
    mode: 'Online',
    teacher: 'Anjali Nair (Senior Software Architect & Mentor)',
    timings: 'Sat & Sun (10:00 AM - 12:30 PM)',
    fee: 3200,
    feeType: 'per month',
    seatsAvailable: 15,
    maxSeats: 25,
    syllabus: [
      { unit: 'Python Core', topics: 'Functions, Recursion, File Handling, Exception Handling' },
      { unit: 'Data Structures', topics: 'Stacks, Queues, Computational Complexity' },
      { unit: 'Databases', topics: 'Relational Data Modeling, SQL Queries, Joins, Python-SQL Connectivity' }
    ]
  },
  {
    id: 'course-5',
    title: 'Class 10 English Language & Literature Masterclass',
    slug: 'class-10-english-masterclass',
    classGrade: 'Class 10',
    subject: 'English',
    description: 'Comprehensive writing skills, reading comprehension techniques, literature text analysis, grammar precision, and creative essays.',
    duration: '6 Months',
    mode: 'Offline',
    teacher: 'Sunita Menon (M.A. English Literature)',
    timings: 'Tue & Thu (4:30 PM - 6:00 PM)',
    fee: 2200,
    feeType: 'per month',
    seatsAvailable: 10,
    maxSeats: 25,
    syllabus: [
      { unit: 'Section A: Reading', topics: 'Discursive & Case-based Passages' },
      { unit: 'Section B: Writing & Grammar', topics: 'Formal Letters, Analytical Paragraphs, Tenses, Modals' },
      { unit: 'Section C: Literature', topics: 'First Flight Prose, Poems, Footprints without Feet' }
    ]
  },
  {
    id: 'course-6',
    title: 'Class 11 Biology NEET Fundamentals',
    slug: 'class-11-biology-neet',
    classGrade: 'Class 11',
    subject: 'Biology',
    description: 'NCERT line-by-line decoding, diagrammatic illustrations, daily practice problem sheets (DPP), and assertion-reason mastery.',
    duration: '1 Year',
    mode: 'Hybrid',
    teacher: 'Dr. Arvind Rao (MBBS, Senior Biology Faculty)',
    timings: 'Mon, Wed, Fri (6:00 PM - 7:30 PM)',
    fee: 3800,
    feeType: 'per month',
    seatsAvailable: 6,
    maxSeats: 20,
    syllabus: [
      { unit: 'Diversity of Living World', topics: 'Biological Classification, Plant Kingdom, Animal Kingdom' },
      { unit: 'Structural Organisation', topics: 'Morphology and Anatomy of Flowering Plants' },
      { unit: 'Cell Structure & Function', topics: 'Cell Cycle, Cell Division, Biomolecules' },
      { unit: 'Human Physiology', topics: 'Breathing, Body Fluids, Excretion, Locomotion' }
    ]
  }
];

const DEFAULT_TEACHERS = [
  {
    id: 'teacher-1',
    fullName: 'Dr. Ramesh Sharma',
    email: 'sharma@edusphere.edu',
    phone: '+91 98765 11001',
    qualification: 'Ph.D. in Physics, 14 Years Teaching',
    subjects: ['Physics', 'Science'],
    bio: 'Former senior faculty at national coaching institute with deep expertise in CBSE Board and JEE Physics.',
    assignedCourses: ['Class 10 CBSE Comprehensive Board Mastery']
  },
  {
    id: 'teacher-2',
    fullName: 'Prof. Priya Verma',
    email: 'priya@edusphere.edu',
    phone: '+91 98765 11002',
    qualification: 'M.Sc. Chemistry (Gold Medalist), 12 Years Teaching',
    subjects: ['Chemistry'],
    bio: 'Specialist in organic chemistry mechanisms, problem-solving heuristics, and exam strategies.',
    assignedCourses: ['Class 12 Physics & Chemistry Excellence']
  },
  {
    id: 'teacher-3',
    fullName: 'Vikram Joshi',
    email: 'vikram@edusphere.edu',
    phone: '+91 98765 11003',
    qualification: 'B.Tech IIT Roorkee, 9 Years Teaching',
    subjects: ['Mathematics'],
    bio: 'Passionate mathematician known for simplifying complex algebraic and geometric proofs for young learners.',
    assignedCourses: ['Class 9 Foundation Builder']
  },
  {
    id: 'teacher-4',
    fullName: 'Anjali Nair',
    email: 'anjali@edusphere.edu',
    phone: '+91 98765 11004',
    qualification: 'M.Tech CSE, Former Tech Lead & Author',
    subjects: ['Computer Science', 'Python'],
    bio: 'Guides students through coding algorithms, Python programming, and logical problem solving with hands-on projects.',
    assignedCourses: ['Class 11 & 12 Computer Science']
  }
];

const DEFAULT_APPLICATIONS = [
  {
    id: 'app-1',
    applicationNumber: 'EDU-2026-8491',
    fullName: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    phone: '9876543211',
    dob: '2010-04-15',
    gender: 'Male',
    address: '42 Lotus Colony, MG Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    currentClass: 'Class 10',
    schoolName: 'Delhi Public School',
    board: 'CBSE',
    courseId: 'course-1',
    courseName: 'Class 10 CBSE Comprehensive Board Mastery',
    preferredMode: 'Hybrid',
    preferredBatch: 'Evening (5:00 PM - 7:00 PM)',
    guardianName: 'Sanjay Mehta',
    guardianRelationship: 'Father',
    guardianPhone: '9876543210',
    guardianEmail: 'sanjay.mehta@example.com',
    status: 'Approved',
    adminNotes: 'Application verified. High academic performance. Assigned to Batch A.',
    createdAt: '2026-09-10T10:30:00Z',
    verificationPin: '1234'
  },
  {
    id: 'app-2',
    applicationNumber: 'EDU-2026-8492',
    fullName: 'Diya Sundaram',
    email: 'diya.sundaram@example.com',
    phone: '9876543222',
    dob: '2008-11-20',
    gender: 'Female',
    address: '15 Anna Nagar 2nd Avenue',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600040',
    currentClass: 'Class 12',
    schoolName: 'Kendriya Vidyalaya',
    board: 'CBSE',
    courseId: 'course-2',
    courseName: 'Class 12 Physics & Chemistry Excellence (JEE / NEET Prep)',
    preferredMode: 'Online',
    preferredBatch: 'Evening (6:00 PM - 8:00 PM)',
    guardianName: 'K. Sundaram',
    guardianRelationship: 'Father',
    guardianPhone: '9876543220',
    guardianEmail: 'k.sundaram@example.com',
    status: 'Under Review',
    adminNotes: 'Subject choices received. Scheduling brief academic counseling call.',
    createdAt: '2026-09-12T14:15:00Z',
    verificationPin: '4321'
  },
  {
    id: 'app-3',
    applicationNumber: 'EDU-2026-8493',
    fullName: 'Kabir Patel',
    email: 'kabir.patel@example.com',
    phone: '9876543233',
    dob: '2011-06-08',
    gender: 'Male',
    address: '78 Navrangpura Crescent',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380009',
    currentClass: 'Class 9',
    schoolName: 'St. Xavier High School',
    board: 'ICSE',
    courseId: 'course-3',
    courseName: 'Class 9 Foundation Builder in Mathematics & Science',
    preferredMode: 'Offline',
    preferredBatch: 'Afternoon (4:00 PM - 5:30 PM)',
    guardianName: 'Nita Patel',
    guardianRelationship: 'Mother',
    guardianPhone: '9876543230',
    guardianEmail: 'nita.patel@example.com',
    status: 'Pending',
    adminNotes: 'New application received.',
    createdAt: '2026-09-14T09:00:00Z',
    verificationPin: '5678'
  }
];

const DEFAULT_SCHEDULES = [
  {
    id: 'sched-1',
    courseId: 'course-1',
    courseName: 'Class 10 CBSE Comprehensive Board Mastery',
    batchName: 'Batch 10-A (Morning/Eve)',
    teacherName: 'Dr. Ramesh Sharma',
    subject: 'Physics',
    topic: 'Light: Reflection and Refraction Deep Dive',
    date: 'Today',
    time: '05:00 PM - 06:30 PM',
    mode: 'Online',
    platform: 'Google Meet',
    meetingUrl: 'https://meet.google.com/edu-sph-live',
    status: 'Upcoming'
  },
  {
    id: 'sched-2',
    courseId: 'course-2',
    courseName: 'Class 12 Physics & Chemistry Excellence',
    batchName: 'Batch 12-JEE',
    teacherName: 'Prof. Priya Verma',
    subject: 'Chemistry',
    topic: 'Coordination Compounds & Valence Bond Theory',
    date: 'Today',
    time: '06:30 PM - 08:00 PM',
    mode: 'Online',
    platform: 'Google Meet',
    meetingUrl: 'https://meet.google.com/che-xyz-room',
    status: 'Upcoming'
  },
  {
    id: 'sched-3',
    courseId: 'course-3',
    courseName: 'Class 9 Foundation Builder',
    batchName: 'Batch 9-Foundation',
    teacherName: 'Vikram Joshi',
    subject: 'Mathematics',
    topic: 'Euclidean Geometry & Axiom Proofs',
    date: 'Tomorrow',
    time: '04:00 PM - 05:30 PM',
    mode: 'Offline',
    platform: 'Classroom 102',
    meetingUrl: '',
    status: 'Scheduled'
  }
];

const DEFAULT_MATERIALS = [
  {
    id: 'mat-1',
    title: 'Class 10 Physics: Complete Formula Sheet & Ray Diagrams',
    subject: 'Physics',
    courseId: 'course-1',
    courseName: 'Class 10 CBSE Comprehensive Board Mastery',
    fileType: 'PDF',
    size: '2.4 MB',
    uploadedBy: 'Dr. Ramesh Sharma',
    uploadedDate: 'Sep 12, 2026',
    downloadUrl: '#'
  },
  {
    id: 'mat-2',
    title: 'Class 12 Chemistry: Organic Reaction Mechanism Cheat Codes',
    subject: 'Chemistry',
    courseId: 'course-2',
    courseName: 'Class 12 Physics & Chemistry Excellence',
    fileType: 'PDF',
    size: '3.8 MB',
    uploadedBy: 'Prof. Priya Verma',
    uploadedDate: 'Sep 10, 2026',
    downloadUrl: '#'
  },
  {
    id: 'mat-3',
    title: 'Python 3 Quick Reference & Object-Oriented Cheat Sheet',
    subject: 'Computer Science',
    courseId: 'course-4',
    courseName: 'Class 11 & 12 Computer Science',
    fileType: 'DOCX',
    size: '1.2 MB',
    uploadedBy: 'Anjali Nair',
    uploadedDate: 'Sep 08, 2026',
    downloadUrl: '#'
  }
];

const DEFAULT_ASSIGNMENTS = [
  {
    id: 'assign-1',
    title: 'Physics Worksheet: Numerical Problems on Lens Formula & Magnification',
    courseId: 'course-1',
    courseName: 'Class 10 CBSE Comprehensive Board Mastery',
    teacherName: 'Dr. Ramesh Sharma',
    dueDate: '2026-09-22',
    maxMarks: 25,
    status: 'Pending Submission',
    instructions: 'Solve questions 1 through 15 on ruled sheets. Show step-by-step ray construction diagrams.',
    mySubmission: null
  },
  {
    id: 'assign-2',
    title: 'Chemistry Quiz 04: Chemical Kinetics Rate Laws',
    courseId: 'course-2',
    courseName: 'Class 12 Physics & Chemistry Excellence',
    teacherName: 'Prof. Priya Verma',
    dueDate: '2026-09-18',
    maxMarks: 30,
    status: 'Submitted',
    instructions: 'Upload scanned PDF of reaction rate problem sets with initial rate computations.',
    mySubmission: {
      submittedAt: '2026-09-14 18:20',
      fileName: 'rahul_kinetics_submission.pdf',
      grade: '28 / 30',
      remarks: 'Excellent calculation of pseudo-first order half-life. Clean layout.'
    }
  }
];

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Term 1 Mock Board Examination Schedule Announced',
    target: 'All Students',
    date: 'Sep 14, 2026',
    author: 'Academic Administration',
    content: 'The first series of full-syllabus mock tests will commence from Oct 05, 2026. Hall tickets and batch seating plans will be released on the student portal next Monday.'
  },
  {
    id: 'ann-2',
    title: 'Special Sunday Doubt-Clearing Clinic for Class 10 & 12',
    target: 'Class 10 & 12 Batches',
    date: 'Sep 13, 2026',
    author: 'Dr. Ramesh Sharma',
    content: 'Live interactive doubt session on numerical problem solving will be held this Sunday at 10:30 AM via Google Meet. Bring your textbook and question bank doubts.'
  }
];

// Initialize Storage Helper
function getStore(key, defaultValue) {
  try {
    const item = localStorage.getItem('edusphere_' + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setStore(key, value) {
  try {
    localStorage.setItem('edusphere_' + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error', e);
  }
}

// Ensure defaults are populated in localStorage for instant offline/mock preview
if (!localStorage.getItem('edusphere_courses')) setStore('courses', DEFAULT_COURSES);
if (!localStorage.getItem('edusphere_teachers')) setStore('teachers', DEFAULT_TEACHERS);
if (!localStorage.getItem('edusphere_applications')) setStore('applications', DEFAULT_APPLICATIONS);
if (!localStorage.getItem('edusphere_schedules')) setStore('schedules', DEFAULT_SCHEDULES);
if (!localStorage.getItem('edusphere_materials')) setStore('materials', DEFAULT_MATERIALS);
if (!localStorage.getItem('edusphere_assignments')) setStore('assignments', DEFAULT_ASSIGNMENTS);
if (!localStorage.getItem('edusphere_announcements')) setStore('announcements', DEFAULT_ANNOUNCEMENTS);

// Central API Service
export const API = {
  // Config
  baseUrl: API_BASE,

  // Helper for requests with auth header
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('edusphere_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { credentials: 'omit', credentials: 'same-origin', ...options, headers });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      // Return null or rethrow based on caller
      throw err;
    }
  },

  // --- COURSES ---
  async getCourses() {
    try {
      return await this.request('/courses');
    } catch (e) {
      return getStore('courses', DEFAULT_COURSES);
    }
  },

  async getCourseById(id) {
    try {
      return await this.request(`/courses/${id}`);
    } catch (e) {
      const list = getStore('courses', DEFAULT_COURSES);
      return list.find(c => c.id === id || c.slug === id) || null;
    }
  },

  async createCourse(courseData) {
    try {
      return await this.request('/courses', {
        method: 'POST',
        body: JSON.stringify(courseData)
      });
    } catch (e) {
      const list = getStore('courses', DEFAULT_COURSES);
      const newCourse = {
        ...courseData,
        id: 'course-' + Date.now(),
        seatsAvailable: courseData.maxSeats || 25
      };
      list.push(newCourse);
      setStore('courses', list);
      return newCourse;
    }
  },

  // --- ADMISSIONS & APPLICATIONS ---
  async submitApplication(appData) {
    try {
      return await this.request('/applications', {
        method: 'POST',
        body: JSON.stringify(appData)
      });
    } catch (e) {
      const list = getStore('applications', DEFAULT_APPLICATIONS);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const applicationNumber = `EDU-${new Date().getFullYear()}-${randomNum}`;
      const newApp = {
        id: 'app-' + Date.now(),
        applicationNumber,
        ...appData,
        status: 'Pending',
        adminNotes: 'Application submitted online. Pending staff review.',
        createdAt: new Date().toISOString()
      };
      list.unshift(newApp);
      setStore('applications', list);
      return newApp;
    }
  },

  async trackApplication(applicationNumber, identifier) {
    try {
      return await this.request(`/applications/track?number=${encodeURIComponent(applicationNumber)}&identifier=${encodeURIComponent(identifier)}`);
    } catch (e) {
      const list = getStore('applications', DEFAULT_APPLICATIONS);
      const cleanNum = applicationNumber.trim().toUpperCase();
      const cleanId = identifier ? identifier.trim() : '';

      const match = list.find(app => {
        const matchesNum = app.applicationNumber.toUpperCase() === cleanNum || app.id === cleanNum;
        if (!matchesNum) return false;
        if (!cleanId) return true;
        // Verify phone or dob
        return (app.phone && app.phone.includes(cleanId)) || 
               (app.dob && app.dob === cleanId) || 
               (app.verificationPin && app.verificationPin === cleanId);
      });

      if (!match) {
        throw new Error('No matching application found with provided credentials.');
      }
      return match;
    }
  },

  async getAllApplications() {
    try {
      return await this.request('/applications');
    } catch (e) {
      return getStore('applications', DEFAULT_APPLICATIONS);
    }
  },

  async updateApplicationStatus(id, status, notes = '') {
    try {
      return await this.request(`/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes })
      });
    } catch (e) {
      const list = getStore('applications', DEFAULT_APPLICATIONS);
      const idx = list.findIndex(a => a.id === id);
      if (idx !== -1) {
        list[idx].status = status;
        if (notes) list[idx].adminNotes = notes;
        setStore('applications', list);
        return list[idx];
      }
      throw new Error('Application not found');
    }
  },

  // --- TEACHERS ---
  async getTeachers() {
    try {
      return await this.request('/teachers');
    } catch (e) {
      return getStore('teachers', DEFAULT_TEACHERS);
    }
  },

  // --- SCHEDULES & ONLINE CLASSES ---
  async getSchedules() {
    try {
      return await this.request('/schedules');
    } catch (e) {
      return getStore('schedules', DEFAULT_SCHEDULES);
    }
  },

  async createSchedule(schedData) {
    try {
      return await this.request('/schedules', {
        method: 'POST',
        body: JSON.stringify(schedData)
      });
    } catch (e) {
      const list = getStore('schedules', DEFAULT_SCHEDULES);
      const newSched = {
        id: 'sched-' + Date.now(),
        ...schedData,
        status: 'Scheduled'
      };
      list.unshift(newSched);
      setStore('schedules', list);
      return newSched;
    }
  },

  // --- MATERIALS ---
  async getMaterials() {
    try {
      return await this.request('/materials');
    } catch (e) {
      return getStore('materials', DEFAULT_MATERIALS);
    }
  },

  async uploadMaterial(matData) {
    try {
      return await this.request('/materials', {
        method: 'POST',
        body: JSON.stringify(matData)
      });
    } catch (e) {
      const list = getStore('materials', DEFAULT_MATERIALS);
      const newMat = {
        id: 'mat-' + Date.now(),
        ...matData,
        uploadedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      };
      list.unshift(newMat);
      setStore('materials', list);
      return newMat;
    }
  },

  // --- ASSIGNMENTS ---
  async getAssignments() {
    try {
      return await this.request('/assignments');
    } catch (e) {
      return getStore('assignments', DEFAULT_ASSIGNMENTS);
    }
  },

  async createAssignment(assignData) {
    try {
      return await this.request('/assignments', {
        method: 'POST',
        body: JSON.stringify(assignData)
      });
    } catch (e) {
      const list = getStore('assignments', DEFAULT_ASSIGNMENTS);
      const newAssign = {
        id: 'assign-' + Date.now(),
        ...assignData,
        status: 'Pending Submission',
        mySubmission: null
      };
      list.unshift(newAssign);
      setStore('assignments', list);
      return newAssign;
    }
  },

  async submitAssignment(assignmentId, submissionData) {
    try {
      return await this.request(`/assignments/${assignmentId}/submissions`, {
        method: 'POST',
        body: JSON.stringify(submissionData)
      });
    } catch (e) {
      const list = getStore('assignments', DEFAULT_ASSIGNMENTS);
      const item = list.find(a => a.id === assignmentId);
      if (item) {
        item.status = 'Submitted';
        item.mySubmission = {
          submittedAt: new Date().toLocaleString(),
          fileName: submissionData.fileName || 'assignment_submission.pdf',
          grade: 'Pending Review',
          remarks: 'Submitted on time. Awaiting teacher evaluation.'
        };
        setStore('assignments', list);
        return item;
      }
      throw new Error('Assignment not found');
    }
  },

  // --- ANNOUNCEMENTS ---
  async getAnnouncements() {
    try {
      return await this.request('/announcements');
    } catch (e) {
      return getStore('announcements', DEFAULT_ANNOUNCEMENTS);
    }
  },

  async createAnnouncement(annData) {
    try {
      return await this.request('/announcements', {
        method: 'POST',
        body: JSON.stringify(annData)
      });
    } catch (e) {
      const list = getStore('announcements', DEFAULT_ANNOUNCEMENTS);
      const newAnn = {
        id: 'ann-' + Date.now(),
        ...annData,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      };
      list.unshift(newAnn);
      setStore('announcements', list);
      return newAnn;
    }
  },

  // --- BRANDING CONFIGURATION ---
  getBrandingConfig() {
    const defaultBranding = {
      name: 'EduSphere',
      tagline: 'Learn Better. Grow Smarter. Achieve More.',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      email: 'admissions@edusphere.edu',
      address: 'Plot 45, Knowledge Boulevard, Tech Park Road, Bengaluru 560100',
      workingHours: 'Mon – Sat: 9:00 AM – 8:00 PM | Sun: 10:00 AM – 2:00 PM',
      primaryColor: '#4f46e5',
      socialLinks: {
        youtube: 'https://youtube.com',
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        linkedin: 'https://linkedin.com'
      }
    };
    return getStore('branding_config', defaultBranding);
  },

  saveBrandingConfig(newConfig) {
    const current = this.getBrandingConfig();
    const updated = { ...current, ...newConfig };
    setStore('branding_config', updated);
    return updated;
  }
};
