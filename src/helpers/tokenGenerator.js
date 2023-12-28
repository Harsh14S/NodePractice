import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const tokenGenerator = (obj = {}, expiry = "1h") => {
  const accessToken = jwt.sign(obj, config.PASSWORD_RESET_TOKEN, {
    expiresIn: expiry,
  });
  return accessToken;
};

export const tokenVerifier = (token = "") => {
  try {
    const verifyToken = jwt.verify(token, config.PASSWORD_RESET_TOKEN);
    return verifyToken;
  } catch (error) {
    return { error: true, name: error.name };
  }
};
