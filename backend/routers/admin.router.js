import express from "express";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";
import { getAdminDashboardStats, getAnalyticsStats } from "../controllers/admin.controller.js";
import { adminUploadTemplate, getTemplates, deleteTemplate } from "../controllers/template.controller.js";
import upload from "../middlewares/upload.js";
const adminRouter = express.Router();

adminRouter.get("/dashboard-stat", isAuth, isAdmin, getAdminDashboardStats);
adminRouter.get("/analytics-stat", isAuth, isAdmin, getAnalyticsStats);

// Admin Template Management
adminRouter.post(
  "/templates/upload",
  isAuth,
  isAdmin,
  upload.fields([{ name: "templateFile", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]),
  adminUploadTemplate
);
adminRouter.get("/templates", isAuth, isAdmin, getTemplates);
adminRouter.delete("/templates/:id", isAuth, isAdmin, deleteTemplate);


export default adminRouter;