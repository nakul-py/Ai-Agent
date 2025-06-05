import express from "express";
import {
  signup,
  login,
  logout,
  updateUser,
  getUsers,
} from "../controller/user.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/update-user", authenticate, updateUser);
router.get("/users", authenticate, getUsers);

export default router;
