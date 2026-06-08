import { Document } from "mongoose";

export interface IModel extends Document {
  _id: string;
  userName: string;
  email: string;
  password: string;
  mobile: number;
  imageUrl: string;
  description: string;
  role: string;
  permissions: { action: string; resource: string }[];
  createdBy: string;
  active: boolean;
  archive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MapResponse{
    message: string;
    data?: any;
} 

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminTokenPayload {
  _id: string;
  userName: string;
  email: string;
  role: string;
  type: "access" | "refresh";
}

export interface AdminAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AdminRefreshPayload {
  userId: string;
  type: "access" | "refresh";
}

export interface Create {
  userName: string;
  email: string;
  password: string;
  mobile: number;
  imageUrl: string;
  description: string;
  permissions: { action: string; resource: string }[];
}

export interface CreateSuperAdmin {
  userName: string;
  email: string;
  password: string;
  role: string;
}

export interface GetSuperAdmin {
  password: string | null;
  userName: string;
  email: string;
 
}

export interface UpdateSuperAdmin {
  userName?: string;
  email?: string;
  password?: string;
}

export interface CreateEnhance extends Create {
  _id: string;
  role: string;
  createdBy: string;
}

export interface id {
  _id:string
}
export interface Update {
  userName?: string;
  email?: string;
  mobile?: number;
  imageUrl?: string;
  description?: string;
  permissions?: { action: string; resource: string }[];
}

export interface CreateResponse {
  _id: string;
  userName: string;
  email: string;
  mobile: number;
  imageUrl: string;
  description: string;
  role: string;
  active: boolean;
  permissions: { action: string; resource: string }[];
}


export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}