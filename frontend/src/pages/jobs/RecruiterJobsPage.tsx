import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

/**
 * RecruiterJobsPage
 *
 * Job management dashboard for recruiters.
 * Placeholder for MVP - will contain job CRUD, filters, and "My Jobs" view.
 */
export default function RecruiterJobsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Jobs Management</h1>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Create Job
        </Button>
      </div>

      <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="text-lg font-semibold mb-2">
            Recruiter Dashboard Coming Soon
          </h3>
          <p className="text-muted-foreground mb-4">
            Create, manage, and track job postings
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Create and publish job postings</p>
            <p>• Filter jobs by status (Draft/Published/Archived)</p>
            <p>• View all applications per job</p>
            <p>• Manage your posted jobs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
