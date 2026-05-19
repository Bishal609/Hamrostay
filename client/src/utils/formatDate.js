import { format, formatDistanceToNow, differenceInDays } from "date-fns";

export const fmtDate      = (d) => format(new Date(d), "MMM dd, yyyy");
export const fmtDatetime  = (d) => format(new Date(d), "MMM dd, yyyy • hh:mm a");
export const fmtRelative  = (d) => formatDistanceToNow(new Date(d), { addSuffix: true });
export const nightsBetween = (ci, co) => differenceInDays(new Date(co), new Date(ci));