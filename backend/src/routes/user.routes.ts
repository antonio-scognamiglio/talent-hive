/// <reference path="../types/express.d.ts" />
import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { userService } from "../services/user.service";
import type { ListUsersDto, UpdateProfileDto } from "@shared/types";
import { ValidationError } from "../errors/app.error";

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

/**
 * PUT /api/users/profile
 * Update current user profile
 * Auth: Required
 */
router.put(
  "/profile",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const body: UpdateProfileDto = req.body;

      // Basic validation
      if (!body.firstName || !body.lastName) {
        throw new ValidationError("firstName e lastName sono obbligatori");
      }

      const result = await userService.updateProfile(user.id, body);
      res.json(result);
    } catch (error) {
      next(error); // Pass to error middleware
    }
  },
);

export default router;
