/// <reference path="../types/express.d.ts" />
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { jobService } from "../services/job.service";
import type { ListJobsDto } from "@shared/types";

const router = Router();

/**
 * POST /api/jobs/list
 * Get jobs with pagination and filters
 * Auth: Required
 * Body: { skip, take, where: { status?, title?, location? }, orderBy? }
 */
router.post("/list", authMiddleware, async (req, res) => {
  try {
    const query: ListJobsDto = req.body;
    const result = await jobService.getJobs(query, req.user!);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/jobs/:id
 * Get job by ID
 * Auth: Required
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const job = await jobService.getJobById(req.params.id, req.user!);
    res.json(job);
  } catch (error) {
    const message = (error as Error).message;
    const status = message === "Job not found" ? 404 : 500;
    res.status(status).json({ error: message });
  }
});

/**
 * POST /api/jobs
 * Create new job
 * Auth: Required (RECRUITER, ADMIN)
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    // Role check
    if (req.user!.role === "CANDIDATE") {
      return res.status(403).json({ error: "Candidates cannot create jobs" });
    }

    const job = await jobService.createJob(req.body, req.user!.id);
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * PATCH /api/jobs/:id
 * Update job
 * Auth: Required (Owner or ADMIN)
 */
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const job = await jobService.updateJob(req.params.id, req.body, req.user!);
    res.json(job);
  } catch (error) {
    const message = (error as Error).message;
    const status =
      message === "Job not found"
        ? 404
        : message.includes("only update")
        ? 403
        : 500;
    res.status(status).json({ error: message });
  }
});

/**
 * DELETE /api/jobs/:id
 * Archive job (soft delete)
 * Auth: Required (Owner or ADMIN)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const job = await jobService.archiveJob(req.params.id, req.user!);
    res.json(job);
  } catch (error) {
    const message = (error as Error).message;
    const status =
      message === "Job not found"
        ? 404
        : message.includes("only archive")
        ? 403
        : 500;
    res.status(status).json({ error: message });
  }
});

export default router;
