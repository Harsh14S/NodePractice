import { Router } from "express";
import { AdminCreate } from "../controllers/user/admin.controller.js";

const router = Router();

router.route("/create").post(AdminCreate);

export default router;
