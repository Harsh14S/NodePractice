import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use((req, res, next) => {
  // Allow requests from any origin
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Allow the following methods
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH"
  );
  // Allow the following headers
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // Allow credentials (if needed)
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export default app;