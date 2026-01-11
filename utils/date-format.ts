import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

/**
 * Format date to dd-mm-yyyy format
 * @param date - Date string, Date object, or dayjs object
 * @returns Formatted date string in dd-mm-yyyy format
 */
export const formatDate = (date: string | Date | dayjs.Dayjs | null | undefined): string => {
  if (!date) return "N/A";
  return dayjs(date).format("DD-MM-YYYY");
};

/**
 * Format date to dd-mm-yyyy with time
 * @param date - Date string, Date object, or dayjs object
 * @returns Formatted date string in dd-mm-yyyy hh:mm A format
 */
export const formatDateTime = (date: string | Date | dayjs.Dayjs | null | undefined): string => {
  if (!date) return "N/A";
  return dayjs(date).format("DD-MM-YYYY hh:mm A");
};

/**
 * Format date to dd MMM yyyy format (e.g., 04 Dec 2025)
 * @param date - Date string, Date object, or dayjs object
 * @returns Formatted date string in dd MMM yyyy format
 */
export const formatDateShort = (date: string | Date | dayjs.Dayjs | null | undefined): string => {
  if (!date) return "N/A";
  return dayjs(date).format("DD MMM YYYY");
};

/**
 * Format date to dd MMM format (e.g., 04 Dec)
 * @param date - Date string, Date object, or dayjs object
 * @returns Formatted date string in dd MMM format
 */
export const formatDateVeryShort = (date: string | Date | dayjs.Dayjs | null | undefined): string => {
  if (!date) return "N/A";
  return dayjs(date).format("DD MMM");
};
