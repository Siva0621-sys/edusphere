/**
 * EDUSPHERE SCHEDULE MANAGEMENT MODULE (schedule.js)
 * Implements schedule conflict detection (overlap prevention between teacher or batch),
 * date/time formatting, and timetable view state.
 */

export const ScheduleManager = {
  // Check whether two time slots conflict on the same date
  hasConflict(slotA, slotB) {
    if (slotA.date !== slotB.date) return false;
    
    // Check batch conflict
    const batchConflict = slotA.batchName && slotB.batchName && (slotA.batchName === slotB.batchName);
    // Check teacher conflict
    const teacherConflict = slotA.teacherName && slotB.teacherName && (slotA.teacherName === slotB.teacherName);

    if (!batchConflict && !teacherConflict) return false;

    // Time overlap check
    return slotA.time === slotB.time;
  },

  // Validate schedule input before saving
  validateSchedule(newSchedule, existingSchedules = []) {
    if (!newSchedule.subject || !newSchedule.topic || !newSchedule.date || !newSchedule.time) {
      throw new Error('All schedule details (subject, topic, date, time) are required.');
    }

    const conflict = existingSchedules.find(existing => this.hasConflict(newSchedule, existing));
    if (conflict) {
      throw new Error(`Schedule conflict detected! ${conflict.teacherName || conflict.batchName} is already scheduled for "${conflict.topic}" at this time.`);
    }

    return true;
  }
};
