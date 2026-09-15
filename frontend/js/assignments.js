/**
 * EDUSPHERE ASSIGNMENTS MODULE (assignments.js)
 * Manages assignment lifecycle: publishing, submissions, due date validation, and evaluation.
 */

export const AssignmentManager = {
  isOverdue(dueDateString) {
    if (!dueDateString) return false;
    const due = new Date(dueDateString);
    const now = new Date();
    return now > due;
  },

  validateSubmission(submission) {
    if (!submission.fileName) {
      throw new Error('Please select a file to submit.');
    }
    return true;
  }
};
