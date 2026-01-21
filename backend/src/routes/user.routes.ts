/// <reference path="../types/express.d.ts" />
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { userService } from "../services/user.service";
import type { ListUsersDto } from "@shared/types";

const router = Router();

/**
 * POST /api/users/list
 * Get users with pagination and filters
 * Auth: Required (RECRUITER, ADMIN only)
 */
router.post("/list", authMiddleware, async (req, res) => {
  try {
    const user = req.user!;

    // RBAC Check
    if (user.role === "CANDIDATE") {
      return res.status(403).json({ error: "Access denied" });
    }

    const query: ListUsersDto = req.body;
    const result = await userService.getUsers(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
