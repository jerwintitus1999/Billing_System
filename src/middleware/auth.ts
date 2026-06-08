import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../utils/customError";
import { TokenPayload, IAuth } from "../auth/type";
import { AdminTokenPayload } from "../superadmin/type";
import envConfig from "../config/env";
import { AuthModel } from "../auth/model";
import { AdminModel } from "../superadmin/model";
import { Model } from "mongoose";

export interface UserRequestData {
  _id: string;
  userId?: string; //import userId in userRequestData
  role:string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserRequestData;
    }
  }
};

const model: Record< 'user' | 'super' , Model<any>> = {
  user: AuthModel,
  super: AdminModel,
  // doctor: DoctorModel,
};

export const authenticate = (requiredRole: 'user'  | 'super' ) => {

 return async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new CustomError("No token provided", 401));
  }

  const token = authHeader.split(" ")[1]; 

    const decoded = jwt.verify(
      token,
      envConfig.jwt.accesssecret
    ) as | TokenPayload | AdminTokenPayload;
   
    if (decoded.type !== "access")
      return next(new CustomError("Invalid token type", 401));
    

    const userModel = model[requiredRole];
 
    if (!userModel) {
      return next(new CustomError("Invalid role provided", 400));
    }

    if(decoded.role !== requiredRole){
      return next(new CustomError("You are restricted to access this data", 401))
    }

    let projection: Record<string, number>;
    switch(requiredRole){
      case 'user':
        projection = {
          _id:1,
          userName:1,
          gender:1,
          userId:1, 
          mobile: 1,
          role:1,
        };
        break;
        case 'super':
        projection = {
          _id:1,
          userName:1,
          email:1,
          role:1, 
        };
        break;
        default:
        return next(new CustomError("Unsupported role", 400));
    }

    const checkUser = await userModel.findById(decoded._id,projection);

    if (!checkUser) return next(new CustomError("Invalid User", 401));

    req.user = checkUser as UserRequestData;
    next();
  } catch (error:any) {  
    if (error.name === 'TokenExpiredError') {
      return next(new CustomError("Token expired", 401));
    } 
    next(new CustomError("Invalid token", 401));
  }
}
}
;
