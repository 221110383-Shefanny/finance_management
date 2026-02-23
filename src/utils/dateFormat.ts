/**
 * Format date to DD/MM/YYYY format
 * @param date - Date string or Date object (YYYY-MM-DD or Date)
 * @returns Formatted date string in DD/MM/YYYY format
 */
export const formatDateToDDMMYYYY = (
  date: string | Date | undefined | null,
): string => {
  // Handle undefined/null/empty values
  if (!date) {
    return "N/A";
  }

  try {
    let dateObj: Date;

    if (typeof date === "string") {
      // If date is YYYY-MM-DD format, parse it
      if (date.includes("-")) {
        dateObj = new Date(date + "T00:00:00");
      } else if (date.includes("/")) {
        // If already in DD/MM/YYYY format, return as is
        const parts = date.split("/");
        if (parts.length === 3 && parts[0].length === 2) {
          return date;
        }
        dateObj = new Date(date);
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }

    // Validate that dateObj is a valid date
    if (isNaN(dateObj.getTime())) {
      console.warn("Invalid date:", date);
      return "N/A";
    }

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(
      2,
      "0",
    );
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.warn("Error formatting date:", date, error);
    return "N/A";
  }
};

/**
 * Get today's date in DD/MM/YYYY format
 * @returns Today's date as DD/MM/YYYY string
 */
export const getTodayDDMMYYYY = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Get today's date in YYYY-MM-DD format (for input[type="date"])
 * @returns Today's date as YYYY-MM-DD string
 */
export const getTodayYYYYMMDD = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Convert DD/MM/YYYY to YYYY-MM-DD format (for input[type="date"])
 * @param date - Date string in DD/MM/YYYY format
 * @returns Date string in YYYY-MM-DD format
 */
export const convertDDMMYYYYtoYYYYMMDD = (
  date: string,
): string => {
  try {
    const parts = date.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return date;
  } catch (error) {
    console.warn("Error converting date:", date, error);
    return date;
  }
};

/**
 * Convert YYYY-MM-DD to DD/MM/YYYY format
 * @param date - Date string in YYYY-MM-DD format
 * @returns Date string in DD/MM/YYYY format
 */
export const convertYYYYMMDDtoDDMMYYYY = (
  date: string,
): string => {
  try {
    const parts = date.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return date;
  } catch (error) {
    console.warn("Error converting date:", date, error);
    return date;
  }
};

/**
 * Format date and time for history records
 * @returns Object with date in DD/MM/YYYY and time in HH:MM:SS format
 */
export const formatDateTimeForHistory = (): {
  date: string;
  time: string;
} => {
  const now = new Date();
  const date = now.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return { date, time };
};

/**
 * Validate if a date string is in valid DD/MM/YYYY format
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 */
export const isValidDate = (dateString: string): boolean => {
  if (!dateString || dateString.length !== 10) return false;
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateString)) return false;
  const [day, month, year] = dateString.split("/").map(Number);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  return true;
};
