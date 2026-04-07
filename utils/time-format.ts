/**
 * Convert 24-hour time format to 12-hour format with AM/PM
 * @param time24 - Time in 24-hour format (e.g., "14:30" or "09:00")
 * @returns Time in 12-hour format with AM/PM (e.g., "02:30 PM" or "09:00 AM")
 */
export function convert24To12Hour(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) {
    return time24; // Return original if invalid
  }
  
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12; // Convert 0 to 12 for midnight
  
  return `${hours12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Convert a time slot range from 24-hour to 12-hour format
 * @param slot - Time slot in 24-hour format (e.g., "14:00-15:00")
 * @returns Time slot in 12-hour format (e.g., "02:00 PM - 03:00 PM")
 */
export function convertSlotTo12Hour(slot: string): string {
  const [start, end] = slot.split("-");
  
  if (!start || !end) {
    return slot; // Return original if invalid format
  }
  
  // return `${convert24To12Hour(start)} - ${convert24To12Hour(end)}`;
  return `${convert24To12Hour(start)}`;
}
