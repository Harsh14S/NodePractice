import { Router } from "express";
import {
  SignUp,
  Login,
  Logout,
  RequestForgotPassword,
  ForgotPassword,
  ChangePassword,
} from "../controllers/user/admin.controller.js";
import { auth } from "../middleware/Auth.middleware.js";

const router = Router();

router.route("/signup").post(SignUp);
router.route("/login").post(Login);
router.route("/logout").post(auth, Logout);
router.route("/forgotPassword").post(ForgotPassword);
router.route("/requestForgotPassword").post(RequestForgotPassword);
router.route("/changePassword").post(auth, ChangePassword);

export default router;
