/**
 * EDUSPHERE ADMISSION APPLICATION CONTROLLER (admission.js)
 * Multi-step interactive wizard with rigorous client validation, dynamic courses,
 * payload dispatch, and application tracking redirection.
 */

import { API } from './api.js';
import { showToast } from './main.js';

export async function initAdmissionForm() {
  const form = document.getElementById('admissionForm');
  if (!form) return;

  // Populate Courses Dropdown
  const courseSelect = document.getElementById('preferredCourse');
  if (courseSelect) {
    const courses = await API.getCourses();
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedCourse = urlParams.get('course');

    courses.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.title} (${c.classGrade} - ${c.mode})`;
      if (preselectedCourse && (preselectedCourse === c.id || preselectedCourse === c.slug)) {
        opt.selected = true;
      }
      courseSelect.appendChild(opt);
    });
  }

  // Stepper Controller
  let currentStep = 1;
  const totalSteps = 4;
  const stepPanes = document.querySelectorAll('.step-pane');
  const stepItems = document.querySelectorAll('.step-item');
  const btnNext = document.getElementById('btnNextStep');
  const btnPrev = document.getElementById('btnPrevStep');
  const btnSubmit = document.getElementById('btnSubmitAdmission');

  function showStep(step) {
    stepPanes.forEach((pane, idx) => {
      pane.classList.toggle('active', idx + 1 === step);
    });

    stepItems.forEach((item, idx) => {
      const stepIndex = idx + 1;
      item.classList.toggle('active', stepIndex === step);
      item.classList.toggle('completed', stepIndex < step);
    });

    if (btnPrev) btnPrev.style.display = step === 1 ? 'none' : 'inline-flex';
    if (btnNext) btnNext.style.display = step === totalSteps ? 'none' : 'inline-flex';
    if (btnSubmit) btnSubmit.style.display = step === totalSteps ? 'inline-flex' : 'none';

    // Scroll to top of form
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Validation function per step
  function validateCurrentStep(step) {
    let isValid = true;
    const currentPane = document.querySelector(`.step-pane[data-step="${step}"]`);
    if (!currentPane) return true;

    // Required inputs in current pane
    const inputs = currentPane.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
      input.classList.remove('is-invalid');
      const val = input.value.trim();

      if (!val) {
        input.classList.add('is-invalid');
        isValid = false;
      } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        input.classList.add('is-invalid');
        isValid = false;
      } else if (input.type === 'tel' && val.replace(/\D/g, '').length < 10) {
        input.classList.add('is-invalid');
        isValid = false;
      } else if (input.type === 'checkbox' && !input.checked) {
        input.classList.add('is-invalid');
        isValid = false;
      }
    });

    if (!isValid) {
      showToast('Please Complete Required Fields', 'Review the highlighted fields before proceeding.', 'error');
    }
    return isValid;
  }

  // Event Listeners for Next / Prev
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (validateCurrentStep(currentStep)) {
        currentStep++;
        showStep(currentStep);
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
      }
    });
  }

  // Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateCurrentStep(currentStep)) return;

    // Check agreements
    const termsConsent = document.getElementById('termsConsent');
    const privacyConsent = document.getElementById('privacyConsent');
    if ((termsConsent && !termsConsent.checked) || (privacyConsent && !privacyConsent.checked)) {
      showToast('Consent Required', 'Please accept the institute terms & privacy policy to submit.', 'warning');
      return;
    }

    // Set Loading State
    btnSubmit.disabled = true;
    const originalSubmitText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = `<span class="btn-spinner"></span> Submitting Application...`;

    try {
      const formData = new FormData(form);
      const payload = {
        fullName: formData.get('fullName'),
        dob: formData.get('dob'),
        gender: formData.get('gender') || 'Not Specified',
        email: formData.get('email'),
        phone: formData.get('phone'),
        whatsapp: formData.get('whatsapp') || formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        pincode: formData.get('pincode'),
        currentClass: formData.get('currentClass'),
        schoolName: formData.get('schoolName'),
        board: formData.get('board'),
        previousMarks: formData.get('previousMarks') || '',
        courseId: formData.get('preferredCourse'),
        courseName: courseSelect.options[courseSelect.selectedIndex]?.text || 'Tuition Course',
        preferredMode: formData.get('preferredMode') || 'Hybrid',
        preferredBatch: formData.get('preferredBatch') || 'Evening',
        additionalNotes: formData.get('additionalNotes') || '',
        guardianName: formData.get('guardianName'),
        guardianRelationship: formData.get('guardianRelationship'),
        guardianPhone: formData.get('guardianPhone'),
        guardianEmail: formData.get('guardianEmail') || '',
        verificationPin: Math.floor(1000 + Math.random() * 9000).toString()
      };

      const result = await API.submitApplication(payload);

      showToast('Application Submitted Successfully!', `Application ID: ${result.applicationNumber}`, 'success');

      // Redirect to Tracking Confirmation Page
      setTimeout(() => {
        window.location.href = `application-status.html?id=${encodeURIComponent(result.applicationNumber)}&pin=${encodeURIComponent(payload.verificationPin)}`;
      }, 1500);

    } catch (err) {
      console.error(err);
      showToast('Submission Failed', err.message || 'Unable to submit application. Please try again.', 'error');
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalSubmitText;
    }
  });

  // Real-time input invalid removal
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('is-invalid'));
    el.addEventListener('change', () => el.classList.remove('is-invalid'));
  });

  // Initialize view
  showStep(1);
}
