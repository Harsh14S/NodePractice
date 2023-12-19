import dotenv from "dotenv";
dotenv.config();
export default {
  PORT: process.env.PORT,
  DB_LINK: process.env.DATABASE_URL,
  DB_NAME: process.env.DB_NAME,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
};
