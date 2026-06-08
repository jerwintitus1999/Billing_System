import envConfig from "../config/env";
import axios from "axios";

export const generateOTP = (length = 4): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (mobile: string, otp: string): Promise<void> => {
  const fast2smsApiKey = envConfig.sms.fast2smsApiKey; 
  const message = `Your OTP is ${otp}. It is valid for 5 minutes. - WHY TAP`;

  try {
    await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "otp",
        message,
        language: "english",
        numbers: mobile,
      },
      {
        headers: {
          Authorization: fast2smsApiKey!,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};

