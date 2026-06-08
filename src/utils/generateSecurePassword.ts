import crypto from "crypto";

export const generate = (): string => {
  return crypto.randomBytes(3).toString("hex").slice(0, 6);
};
