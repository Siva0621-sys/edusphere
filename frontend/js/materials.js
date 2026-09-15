/**
 * EDUSPHERE STUDY MATERIALS MODULE (materials.js)
 * Manages study materials filtering by subject, preview, and safe document download handling.
 */

export const MaterialsManager = {
  // Validate material upload payload
  validateMaterial(data) {
    if (!data.title || !data.fileType) {
      throw new Error('Material title and valid document file are required.');
    }

    const allowedExtensions = ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'PNG', 'JPG'];
    if (!allowedExtensions.includes(data.fileType.toUpperCase())) {
      throw new Error(`File type .${data.fileType} is not permitted. Allowed formats: PDF, DOCX, PPTX, PNG, JPG.`);
    }

    return true;
  },

  // Format file size
  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }
};
