import express from "express";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";
import {
  getDashboardData,
  getAllUsers,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  changePassword,
  getUserName,
  requestAdminAccess,
  approveAdminRequest,
  rejectAdminRequest
} from "../controllers/user.controller.js";

const userRouter = express.Router();

// ---- User Routes ----
userRouter.get("/dashboard", isAuth, getDashboardData);
// profile (self)
userRouter.get("/profile", isAuth, getProfile);
userRouter.put("/profile", isAuth, updateProfile);
userRouter.put("/password", isAuth, changePassword);
userRouter.get("/profile/:id", isAuth, getUserName);
userRouter.post("/request-admin", isAuth, requestAdminAccess);


// ---- Admin User Routes (DYNAMIC LAST — Admin only) ----
userRouter.get("/", isAuth, isAdmin, getAllUsers);
userRouter.put("/:id", isAuth, isAdmin, updateUser);
userRouter.delete("/:id", isAuth, isAdmin, deleteUser);
userRouter.put("/approve-admin/:id", isAuth, isAdmin, approveAdminRequest);
userRouter.put("/reject-admin/:id", isAuth, isAdmin, rejectAdminRequest);

export default userRouter;

