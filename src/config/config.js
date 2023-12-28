import dotenv from "dotenv";
dotenv.config();
export default {
  URL: process.env.URL,
  PORT: process.env.PORT,
  DB_LINK: process.env.DATABASE_URL,
  DB_NAME: process.env.DB_NAME,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
  MAILER_EMAIL: process.env.MAILER_EMAIL,
  MAILER_PASS: process.env.MAILER_PASS,
  PASSWORD_RESET_TOKEN: process.env.PASSWORD_RESET_TOKEN,
  PASSWORD_SALT: 12,
};
