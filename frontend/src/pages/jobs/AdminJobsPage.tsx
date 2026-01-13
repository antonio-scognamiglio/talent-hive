import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

/**
 * AdminJobsPage
 *
 * Platform-wide job management for administrators.
 * Placeholder for MVP - will contain full job management and user oversight.
 */
export default function AdminJobsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Platform Jobs</h1>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <Users className="mr-2 h-4 w-4" />
            Manage Users
          </Button>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Create Job
          </Button>
        </div>
      </div>

      <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="text-lg font-semibold mb-2">
            Admin Dashboard Coming Soon
          </h3>
          <p className="text-muted-foreground mb-4">
            Manage all jobs, users, and platform settings
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Full access to all job postings</p>
            <p>• User management and provisioning</p>
            <p>• Platform-wide analytics</p>
            <p>• Override ownership restrictions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
