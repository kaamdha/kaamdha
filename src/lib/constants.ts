export const DISTANCE_OPTIONS = [
  { value: 3, label: "3 km" },
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
] as const;

export const SALARY_MIN = 1000;
export const SALARY_MAX = 100000;
export const SALARY_STEP = 500;

export const DAYS_OF_WEEK = [
  { value: "mon", labelEn: "Monday", labelHi: "सोमवार" },
  { value: "tue", labelEn: "Tuesday", labelHi: "मंगलवार" },
  { value: "wed", labelEn: "Wednesday", labelHi: "बुधवार" },
  { value: "thu", labelEn: "Thursday", labelHi: "गुरुवार" },
  { value: "fri", labelEn: "Friday", labelHi: "शुक्रवार" },
  { value: "sat", labelEn: "Saturday", labelHi: "शनिवार" },
  { value: "sun", labelEn: "Sunday", labelHi: "रविवार" },
] as const;

export const LANGUAGES = [
  { value: "hindi", labelEn: "Hindi", labelHi: "हिन्दी" },
  { value: "english", labelEn: "English", labelHi: "अंग्रेज़ी" },
  { value: "tamil", labelEn: "Tamil", labelHi: "तमिल" },
  { value: "bengali", labelEn: "Bengali", labelHi: "बंगाली" },
  { value: "marathi", labelEn: "Marathi", labelHi: "मराठी" },
  { value: "telugu", labelEn: "Telugu", labelHi: "तेलुगु" },
  { value: "gujarati", labelEn: "Gujarati", labelHi: "गुजराती" },
  { value: "kannada", labelEn: "Kannada", labelHi: "कन्नड़" },
  { value: "punjabi", labelEn: "Punjabi", labelHi: "पंजाबी" },
  { value: "odia", labelEn: "Odia", labelHi: "ओड़िया" },
] as const;

export const EXPERIENCE_OPTIONS = [0, 1, 2, 3, 5, 7, 10, 15, 20] as const;

export const SCHEDULE_OPTIONS = [
  "full_time",
  "part_time",
  "flexible",
] as const;

export const HOUSEHOLD_TYPES = [
  "apartment",
  "independent_house",
  "villa",
  "other",
] as const;
