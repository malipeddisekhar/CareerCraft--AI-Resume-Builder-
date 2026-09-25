import jwt from "jsonwebtoken";
import { pool } from "../config/postgresdb.js";

/**
 * isAdmin middleware
 * Must be used AFTER isAuth (which sets req.userId).
 * Verifies that the authenticated user has is_admin = true in the DB.
 */
const isAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const result = await pool.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!result.rows[0].is_admin) {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    next();
  } catch (error) {
    console.error("isAdmin error:", error);
    return res.status(500).json({ message: "Authorization check failed" });
  }
};

export default isAdmin;
