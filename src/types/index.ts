export type PassCategory = "SSLC" | "PUC" | "Degree" | "Others";

export interface FormRecord {
  serialNumber: number;
  name: string;
  number: number;
  email?: string;
  address: string;
  aadhar?: string;
  pass?: PassCategory;
  year?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminRecord {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminTokenPayload {
  id: string;
  username: string;
  email: string;
}
