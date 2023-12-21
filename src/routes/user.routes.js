import { Router } from "express";
import {
  AdminCreate,
  AdminLogin,
  AdminLogout,
} from "../controllers/user/admin.controller.js";
import { auth } from "../middleware/Auth.middleware.js";

const router = Router();

router.route("/create").post(AdminCreate);
router.route("/logout").post(auth, AdminLogout);
router.route("/login").post(AdminLogin);

export default router;
