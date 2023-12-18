import dotenv from "dotenv";
dotenv.config();
export default {
  PORT: process.env.PORT,
  DB_LINK: process.env.DATABASE_URL,
  DB_NAME: process.env.DB_NAME,
};
