/// <reference path="../types/express.d.ts" />
import { Router, NextFunction, Request, Response } from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.middleware";
import { applicationService } from "../services/application.service";
import type { ListApplicationsDto } from "@shared/types";
import { ForbiddenError, ValidationError } from "../errors/app.error";

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
router.post(
  "/list",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: ListApplicationsDto = req.body;
      const result = await applicationService.getApplications(query, req.user!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/applications/my
 * Get candidate's own applications
 * Auth: Required (CANDIDATE)
 */
router.get(
  "/my",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.user!.role !== "CANDIDATE") {
        throw new ForbiddenError("Only candidates can use this endpoint");
      }

      const applications = await applicationService.getMyCandidateApplications(
        req.user!.id,
      );
      res.json(applications);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/applications/:id
 * Get application by ID
 * Auth: Required
 */
router.get(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const application = await applicationService.getApplicationById(
        req.params.id,
        req.user!,
      );
      res.json(application);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/applications/:id/cv
 * Get presigned URL to download CV
 * Auth: Required
 */
router.get(
  "/:id/cv",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const downloadUrl = await applicationService.getCvDownloadUrl(
        req.params.id,
        req.user!,
      );
      res.json({ downloadUrl });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/applications
 * Apply for a job (with CV upload)
 * Auth: Required (CANDIDATE only)
 * Body: multipart/form-data { jobId, coverLetter?, cv (PDF file) }
 */
router.post(
  "/",
  authMiddleware,
  upload.single("cv"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Role check
      if (req.user!.role !== "CANDIDATE") {
        throw new ForbiddenError("Only candidates can apply");
      }

      // File check
      if (!req.file) {
        throw new ValidationError("CV file is required");
      }

      const { jobId, coverLetter } = req.body;

      if (!jobId) {
        throw new ValidationError("jobId is required");
      }

      const application = await applicationService.createApplication(
        { jobId, coverLetter },
        req.file.buffer,
        req.file.originalname,
        req.user!.id,
      );

      res.status(201).json(application);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PATCH /api/applications/:id/workflow
 * Update workflow status (Kanban drag & drop)
 * Auth: Required (RECRUITER/ADMIN - owner only)
 * Body: { workflowStatus: "NEW" | "SCREENING" | "INTERVIEW" | "OFFER" }
 */
router.patch(
  "/:id/workflow",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workflowStatus } = req.body;

      if (!workflowStatus) {
        throw new ValidationError("workflowStatus is required");
      }

      const application = await applicationService.updateWorkflowStatus(
        req.params.id,
        workflowStatus,
        req.user!,
      );

      res.json(application);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/applications/:id/hire
 * Hire candidate (final action)
 * Auth: Required (RECRUITER/ADMIN - owner only)
 */
router.post(
  "/:id/hire",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const application = await applicationService.hireCandidate(
        req.params.id,
        req.user!,
      );
      res.json(application);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/applications/:id/reject
 * Reject candidate (final action)
 * Auth: Required (RECRUITER/ADMIN - owner only)
 * Body: { reason?: string }
 */
router.post(
  "/:id/reject",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reason } = req.body;

      const application = await applicationService.rejectCandidate(
        req.params.id,
        reason,
        req.user!,
      );

      res.json(application);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PATCH /api/applications/:id/notes
 * Add notes/score to application
 * Auth: Required (RECRUITER/ADMIN - owner only)
 * Body: { notes?: string, score?: number }
 */
router.patch(
  "/:id/notes",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notes, score } = req.body;

      const application = await applicationService.updateNotes(
        req.params.id,
        notes,
        score,
        req.user!,
      );

      res.json(application);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
