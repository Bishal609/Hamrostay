export const ROOM_TYPES = ["STANDARD","DELUXE","SUITE","PRESIDENTIAL","PENTHOUSE"];
export const ROOM_STATUSES = ["AVAILABLE","OCCUPIED","MAINTENANCE","RESERVED"];
export const BOOKING_STATUSES = ["PENDING","CONFIRMED","CHECKED_IN","CHECKED_OUT","CANCELLED","REFUNDED"];
export const VENDOR_CATEGORIES = ["FOOD_BEVERAGE","HOUSEKEEPING","MAINTENANCE","LAUNDRY","SPA","TRANSPORT","SECURITY","OTHER"];
export const EXPENSE_CATEGORIES = ["VENDOR_ORDER","UTILITIES","MAINTENANCE","STAFF_SALARY","MARKETING","MISCELLANEOUS"];
export const STATUS_COLORS = {
  PENDING:    "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  CONFIRMED:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  CHECKED_IN: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  CHECKED_OUT:"bg-purple-500/15 text-purple-400 border-purple-500/20",
  CANCELLED:  "bg-red-500/15 text-red-400 border-red-500/20",
  REFUNDED:   "bg-dark-500/15 text-dark-400 border-dark-500/20",
  COMPLETED:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  FAILED:     "bg-red-500/15 text-red-400 border-red-500/20",
  PROCESSING: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  DELIVERED:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  APPROVED:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};