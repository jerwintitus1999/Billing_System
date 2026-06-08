import dotenv from "dotenv";
import path from "path";
import Joi from "joi";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid("production", "development", "test").required(),
  PORT: Joi.number().default(3000),
  MONGODB_URL: Joi.string().required().description("MongoDB connection URL"),
  JWT_ACCESS_SECRET: Joi.string()
    .required()
    .description("JWT accessnsecret key"),
  JWT_REFRESH_SECRET: Joi.string()
    .required()
    .description("JWT refresh secret key"),
  JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
    .default(30)
    .description("Minutes after which access tokens expire"),
  JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
    .default(30)
    .description("Days after which refresh tokens expire"),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
    .default(10)
    .description("Minutes after which reset password token expires"),
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
    .default(10)
    .description("Minutes after which verify email token expires"),
  SMTP_HOST: Joi.string().allow("").description("SMTP server host"),
  SMTP_PORT: Joi.number().allow(null).description("SMTP server port"),
  SMTP_USERNAME: Joi.string().allow("").description("SMTP username"),
  SMTP_PASSWORD: Joi.string().allow("").description("SMTP password"),
  EMAIL_FROM: Joi.string().allow("").description("Sender email address"),
  DO_SPACES_ENDPOINT: Joi.string()
    .required()
    .description("DigitalOcean Spaces endpoint"),
  DO_SPACES_REGION: Joi.string()
    .required()
    .description("DigitalOcean Spaces region"),
  DO_SPACES_ACCESS_KEY_ID: Joi.string()
    .required()
    .description("DigitalOcean Spaces access key ID"),
  DO_SPACES_SECRET_ACCESS_KEY: Joi.string()
    .required()
    .description("DigitalOcean Spaces secret access key"),
  DO_SPACES_FOLDER_PATH: Joi.string()
    .pattern(/^([\w-]+\/)*$/)
    .required()
    .description("Folder path in DigitalOcean Spaces"),
  DO_SPACES_URL: Joi.string()
    .required()
    .description("DigitalOcean Spaces facesync url"),
  FAST2SMS_API_KEY: Joi.string().required().description("Fast2SMS API key"),
}).unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

interface MongooseConfig {
  url: string;
  options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
  };
}

interface JwtConfig {
  accesssecret: string;
  refreshsecret: string;
  accessExpirationMinutes: number;
  refreshExpirationDays: number;
  resetPasswordExpirationMinutes: number;
  verifyEmailExpirationMinutes: number;
}

interface EmailConfig {
  smtp: {
    host?: string;
    port?: number;
    auth: {
      user?: string;
      pass?: string;
    };
  };
  from?: string;
}

interface DoSpacesConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  folderPath: string;
  spaceUrl: string;
}

interface CookieConfig {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict";
  maxAge: number;
}

interface SmsConfig {
  fast2smsApiKey: string;
}

const envConfig = {
  env: envVars.NODE_ENV as "production" | "development" | "test",
  port: envVars.PORT as number,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === "test" ? "-test" : ""),
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  } as MongooseConfig,
  jwt: {
    accesssecret: envVars.JWT_ACCESS_SECRET as string,
    refreshsecret: envVars.JWT_REFRESH_SECRET as string,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES as number,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS as number,
    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES as number,
    verifyEmailExpirationMinutes:
      envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES as number,
  } as JwtConfig,
  email: {
    smtp: {
      host: envVars.SMTP_HOST || "",
      port: envVars.SMTP_PORT || 0,
      auth: {
        user: envVars.SMTP_USERNAME || "",
        pass: envVars.SMTP_PASSWORD || "",
      },
    },
    from: envVars.EMAIL_FROM || "",
  } as EmailConfig,
  doSpaces: {
    endpoint: envVars.DO_SPACES_ENDPOINT as string,
    region: envVars.DO_SPACES_REGION as string,
    accessKeyId: envVars.DO_SPACES_ACCESS_KEY_ID as string,
    secretAccessKey: envVars.DO_SPACES_SECRET_ACCESS_KEY as string,
    folderPath: envVars.DO_SPACES_FOLDER_PATH as string,
    spaceUrl: envVars.DO_SPACES_URL as string,
  } as DoSpacesConfig,
  cookies: {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  } as CookieConfig,
  sms: {
    fast2smsApiKey: envVars.FAST2SMS_API_KEY as string,
  } as SmsConfig,
};

export default envConfig;
