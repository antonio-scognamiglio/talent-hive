/// <reference path="../types/express.d.ts" />
import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.middleware";
import { applicationService } from "../services/application.service";
import type { ListApplicationsDto } from "@shared/types";

const router = Router();

// Multer config for CV upload
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory
  limits: {
    fileSize: 5 * 1024 * 1024, // Max 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

/**
 * POST /api/applications/list
 * Get applications with filters
 * Auth: Required
 */
router.post("/list", authMiddleware, async (req, res) => {
  try {
    const query: ListApplicationsDto = req.body;
    const result = await applicationService.getApplications(query, req.user!);
    res.json(result);
  } catch (error) {
    const message = (error as Error).message;
    const status = message.includes("only view") ? 403 : 500;
    res.status(status).json({ error: message });
  }
});

/**
 * GET /api/applications/my
 * Get candidate's own applications
 * Auth: Required (CANDIDATE)
 */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    if (req.user!.role !== "CANDIDATE") {
      return res
        .status(403)
        .json({ error: "Only candidates can use this endpoint" });
    }

    const applications = await applicationService.getMyCandidateApplications(
      req.user!.id
    );
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/applications/:id
 * Get application by ID
 * Auth: Required
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const application = await applicationService.getApplicationById(
      req.params.id,
      req.user!
    );
    res.json(application);
  } catch (error) {
    const message = (error as Error).message;
    const status =
      message === "Application not found"
        ? 404
        : message.includes("only view")
        ? 403
        : 500;
    res.status(status).json({ error: message });
  }
});

/**
 * POST /api/applications
 * Apply for a job (with CV upload)
 * Auth: Required (CANDIDATE only)
 * Body: multipart/form-data { jobId, coverLetter?, cv (PDF file) }
 */
router.post("/", authMiddleware, upload.single("cv"), async (req, res) => {
  try {
    // Role check
    if (req.user!.role !== "CANDIDATE") {
      return res.status(403).json({ error: "Only candidates can apply" });
    }

    // File check
    if (!req.file) {
      return res.status(400).json({ error: "CV file is required" });
    }

    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: "jobId is required" });
    }

    const application = await applicationService.createApplication(
      { jobId, coverLetter },
      req.file.buffer,
      req.file.originalname,
      req.user!.id
    );

    res.status(201).json(application);
  } catch (error) {
    const message = (error as Error).message;
    const status = message.includes("already applied")
      ? 409
      : message === "Job not found"
      ? 404
      : message.includes("not accepting")
      ? 400
      : 500;
    res.status(status).json({ error: message });
  }
});

/**
 * PATCH /api/applications/:id/workflow
 * Update workflow status (Kanban drag & drop)
 * Auth: Required (RECRUITER/ADMIN - owner only)
 * Body: { workflowStatus: "NEW" | "SCREENING" | "INTERVIEW" | "OFFER" }
 */
router.patch("/:id/workflow", authMiddleware, async (req, res) => {
  try {
    const { workflowStatus } = req.body;

    if (!workflowStatus) {
      return res.status(400).json({ error: "workflowStatus is required" });
    }

    const application = await applicationService.updateWorkflowStatus(
      req.params.id,
      workflowStatus,
      req.user!
    );

    res.json(application);
  } catch (error) {
    const message = (error as Error).message;
    const status =
      message === "Application not found"
        ? 404
        : message.includes("only update")
        ? 403
        : message.includes("Cannot change")
        ? 400
        : 500;
    res.status(status).json({ error: message });
  }
});

/**
 * POST /api/applications/:id/hire
 * Hire candidate (final action)
 * Auth: Required (RECRUITER/ADMIN - owner only)
 */
router.post("/:id/hire", authMiddleware, async (req, res) => {
  try {
    const application = await applicationService.hireCandidate(
      req.params.id,
      req.user!
    );
    res.json(application);
  } catch (error) {
    const message = (error as Error).message;
    const status =
      message === "Application not found"
        ? 404
        : message.includes("only hire")
        ? 403
        : message.includes("already finalized")
        ? 400
        : 500;
    res.status(status).json({ error: message });
  }
});

/**
 * POST /api/applications/:id/reject
 * Reject candidate (final action)
 * Auth: Required (RECRUITER/ADMIN - owner only)
 * Body: { reason?: string }
 */
router.post("/:id/reject", authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;

    const application = await applicationService.rejectCandidate(
      req.params.id,
      reason,
      req.user!
    );

    res.json(application);
  } catch (error) {
    const message = (error as Error).message;
    const status =
      message === "Application not found"
        ? 404
        : message.includes("only reject")
        ? 403
        : message.includes("already finalized")
        ? 400
        : 500;
    res.status(status).json({ error: message });
  }
});

/**
 * PATCH /api/applications/:id/notes
 * Add notes/score to application
 * Auth: Required (RECRUITER/ADMIN - owner only)
 * Body: { notes?: string, score?: number }
 */
router.patch("/:id/notes", authMiddleware, async (req, res) => {
  try {
    const { notes, score } = req.body;

    const application = await applicationService.updateNotes(
      req.params.id,
      notes,
      score,
      req.user!
    );

    res.json(application);
  } catch (error) {
    const message = (error as Error).message;
    const status =
      message === "Application not found"
        ? 404
        : message.includes("only update")
        ? 403
        : 500;
    res.status(status).json({ error: message });
  }
});

export default router;
