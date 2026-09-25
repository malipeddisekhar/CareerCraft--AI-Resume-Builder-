import express from "express";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";
import { getAdminDashboardStats, getAnalyticsStats } from "../controllers/admin.controller.js";
const adminRouter = express.Router();

adminRouter.get("/dashboard-stat", isAuth, isAdmin, getAdminDashboardStats);
adminRouter.get("/analytics-stat", isAuth, isAdmin, getAnalyticsStats);


export default adminRouter;