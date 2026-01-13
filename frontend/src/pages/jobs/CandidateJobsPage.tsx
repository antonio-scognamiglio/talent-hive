/**
 * CandidateJobsPage
 *
 * Job marketplace for candidates.
 * Placeholder for MVP - will contain job listing, search, and application functionality.
 */
export default function CandidateJobsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Available Jobs</h1>

      <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="text-lg font-semibold mb-2">
            Job Marketplace Coming Soon
          </h3>
          <p className="text-muted-foreground mb-4">
            Browse and apply to open positions from your dashboard
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Search jobs by title and location</p>
            <p>• View job details and requirements</p>
            <p>• Submit applications with CV upload</p>
            <p>• Track your application status</p>
          </div>
        </div>
      </div>
    </div>
  );
}
