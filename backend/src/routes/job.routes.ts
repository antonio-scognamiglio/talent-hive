/// <reference path="../types/express.d.ts" />
import { Router, NextFunction, Request, Response } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { jobService } from "../services/job.service";
import type { ListJobsDto } from "@shared/types";
import { ForbiddenError } from "../errors/app.error";

const router = Router();

/**
 * POST /api/jobs/list
 * Get jobs with pagination and filters
 * Auth: Required
 * Body: { skip, take, where: { status?, title?, location? }, orderBy? }
 */
router.post(
  "/list",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: ListJobsDto = req.body;
      const result = await jobService.getJobs(query, req.user!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/jobs/:id
 * Get job by ID
 * Auth: Required
 */
router.get(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await jobService.getJobById(req.params.id, req.user!);
      res.json(job);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/jobs
 * Create new job
 * Auth: Required (RECRUITER, ADMIN)
 */
router.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Role check
      if (req.user!.role === "CANDIDATE") {
        throw new ForbiddenError("Candidates cannot create jobs");
      }

      const job = await jobService.createJob(req.body, req.user!.id);
      res.status(201).json(job);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PATCH /api/jobs/:id
 * Update job
 * Auth: Required (Owner or ADMIN)
 */
router.patch(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await jobService.updateJob(
        req.params.id,
        req.body,
        req.user!,
      );
      res.json(job);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * DELETE /api/jobs/:id
 * Archive job (soft delete)
 * Auth: Required (Owner or ADMIN)
 */
router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await jobService.archiveJob(req.params.id, req.user!);
      res.json(job);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
