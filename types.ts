
export enum CaseStatus {
  MISSING = 'Missing',
  UNDER_INVESTIGATION = 'Under Investigation',
  FOUND = 'Found'
}

export enum UserRole {
  POLICE = 'POLICE',
  CITIZEN = 'CITIZEN'
}

export enum TipStatus {
  PENDING = 'Pending',
  VERIFIED = 'Verified',
  REJECTED = 'Rejected'
}

export interface MissingPerson {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  lastSeenLocation: string;
  dateMissing: string;
  dateReported: string;
  description: string;
  photoBase64: string;
  status: CaseStatus;
  reportedBy: string; // Police Officer ID
}

export interface StatusHistory {
  id: string;
  caseId: string;
  personName: string;
  previousStatus: string;
  updatedStatus: CaseStatus;
  updatedAt: string;
  updatedBy: string;
}

export interface Tip {
  id: string;
  caseId: string;
  personName: string;
  seenLocation: string;
  dateTime: string;
  description: string;
  photoBase64?: string;
  status: TipStatus;
  submittedAt: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  badgeNumber?: string;
}
