import { Document } from "mongoose";

export interface DocModel extends Document {
  _id: string;
  userName: string;
  email: string;
  password: string;
  mobile: number;
  imageUrl: string;
  gender: string;
  role: string;
  active: boolean;
  archive: boolean;
  createdAt: Date;
  updatedAt: Date;


  walletBalance: number;
  isOnline: boolean;

  city: string;
  country: string;

  personalStatement: string;
  experience: string;
  about: string;
  isAccept: boolean;

  clinicName: string;
  clinicDetails: string;

  passedOutYear: string;
  college: string;
  profRef: string;

  bankName: string;
  accountNo: string;
  ifscCode: string;
  aadhaar: string;

  languages: string[];
  specialization: string[];
  artOfInterest: string[];
  awardName: string[];

  memberShip: string;
}


export interface MapResponse{
    message: string;
    data?: any;
} 

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}