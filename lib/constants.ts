export const Role = {
  USER: "USER",
  AI: "AI",
} as const;

export type RoleType = keyof typeof Role;

export const JobStatus = {
  PROCESSING: "PROCESSING",
  READY: "READY",
  FAILED: "FAILED",
} as const;

export type JobStatusType = keyof typeof JobStatus;

export const TaskStatus = {
  PROCESSING: "processing",
  READY: "ready",
  FAILED: "failed",
} as const;

export type TaskStatusType = keyof typeof TaskStatus;

export const JobInsightStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type JobInsightStatusType = keyof typeof JobInsightStatus;

export const TaskInsightStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type TaskInsightStatusType = keyof typeof TaskInsightStatus;

export const PaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type PaymentStatusType = keyof typeof PaymentStatus;
