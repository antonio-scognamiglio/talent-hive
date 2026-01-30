/**
 * JobCardCandidate Component
 *
 * Card component for displaying jobs in the candidate marketplace
 * Shows basic job info with "Applied" badge if the candidate has already applied
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { JobWithApplicationStatus } from "@/features/jobs/hooks/useJobsWithApplicationStatus";
import { MapPin, Banknote, Check } from "lucide-react";
import {
  normalizeDate,
  getRelativeTimeString,
} from "@/features/shared/utils/date.utils";
import {
  JOB_STATUS_LABELS,
  getJobStatusVariant,
} from "@/features/jobs/utils/job-status.utils";
import { formatSalaryRange } from "@/features/jobs/utils/salary-format.utils";

interface JobCardCandidateProps {
  job: JobWithApplicationStatus;
  onView?: (job: JobWithApplicationStatus) => void;
}

/**
 * Job card for candidate marketplace
 * Simple, clean design focused on browsing and discovery
 *
 * Shows:
 * - Job title + status badge (PUBLISHED/ARCHIVED)
 * - Location + Salary
 * - "Applied" badge if already applied
 * - Posted date
 *
 * Click → navigates to job detail page
 */
export function JobCardCandidate({ job, onView }: JobCardCandidateProps) {
  // Check if job is archived (not accepting applications)
  const isArchived = job.status === "ARCHIVED";

  // Posted date
  const postedDate = normalizeDate(job.createdAt, new Date());

  return (
    <Card
      className={cn(
        "h-full flex flex-col transition-all cursor-pointer",
        isArchived
          ? "opacity-50 grayscale"
          : "hover:shadow-lg hover:border-primary/50",
      )}
      onClick={() => onView?.(job)}
    >
      <CardHeader className="pb-3">
        {/* Header: Title + Status Badge + Applied Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg line-clamp-2 mb-2">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Badge */}
              <Badge
                variant="outline"
                className={cn("text-xs", getJobStatusVariant(job.status))}
              >
                {JOB_STATUS_LABELS[job.status]}
              </Badge>

              {/* Applied Badge - shown only if user has applied */}
              {job.hasApplied && (
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Applied
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Location */}
        {job.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Location:{" "}
              <span className="font-medium text-foreground">
                {job.location}
              </span>
            </span>
          </div>
        )}

        {/* Salary Range */}
        {formatSalaryRange(
          job.salaryMin,
          job.salaryMax,
          job.salaryCurrency,
        ) && (
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-700 dark:text-green-400">
              {formatSalaryRange(
                job.salaryMin,
                job.salaryMax,
                job.salaryCurrency,
              )}
            </span>
          </div>
        )}

        {/* Posted Date */}
        <div className="text-xs text-muted-foreground">
          Posted {getRelativeTimeString(postedDate)}
        </div>
      </CardContent>
    </Card>
  );
}
