import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
console.log("__dirname", __dirname);
app.use(express.static(path.join(__dirname, "../public")));

// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
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

import authenticationRoute from "./routes/auth.routes.js";

app.use("/api/v1", authenticationRoute);
// app.use("/api/v1/route", router_name);

export default app;
