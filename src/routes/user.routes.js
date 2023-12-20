import { Router } from "express";
import {
  AdminCreate,
  AdminLogout,
} from "../controllers/user/admin.controller.js";
import { auth } from "../middleware/Auth.middleware.js";

const router = Router();

router.route("/create").post(AdminCreate);
router.route("/logout").post(auth, AdminLogout);

export default router;
