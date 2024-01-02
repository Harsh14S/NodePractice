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
router.route("/template").get((req, res) => {
  const { link } = req.query;
  console.log("link ---> ", link);
  res.render("./ForgotPasswordTemplate/form", { token: 8888888 });
});
router.route("/template2").get((req, res) => {
  res.render("./ForgotPasswordTemplate/html", { token: 8888888 });
});

export default router;
