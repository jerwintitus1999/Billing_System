import { Document } from "mongoose";

export interface IAuth extends Document {
  _id: string,
  userName: string;
  mobile: string;
  email:string;
  imageUrl: string;
  userId: string;
  role: string;
  bio: string;
  gender: string;
  dob: Date;
  active: boolean;
  walletBalance: number;
  languages: string[],
  isAccept: boolean,
  createdAt: Date;
  updatedAt: Date;
  otp?: string | null;
  otpExpiresAt?: Date;
}

export interface IFeedback extends Document{
   userId: string,
   category: string,
   description?: string,
   date: Date,
   active: boolean,
   archive: boolean
}

export interface MapResponse{
    message: string;
    data?: any;
} 

export interface RequestOtpDto {
  userName: string;
  mobile: string;
}

export interface VerifyOtpDto {
  mobile: string;
  otp: string;
}


export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  mobile:string,
  otp:string | null
}
export interface TokenPayload {
  _id: string;
  userName: string;
  gender: string | null;
  userId: string;
  mobile: string,
  role: string;
  type: "access" | "refresh";
}

export interface refreshPayload {
  userId: string;
  type: "access" | "refresh";
}



export interface RegisterProfile {
  userName: string;
  imageUrl: string;
  mobile: string;
  bio: string;
  gender: string;
  dob: Date;

}



export interface User_Id{
  _id: string
}