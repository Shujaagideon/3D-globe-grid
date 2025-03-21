import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "clear messages table",
  { minutes: 3 }, // every minute
  internal.db.cleanupUnpaidPixels
);

export default crons;
