import type { MutationConfigMap } from "@/features/shared/types/mutation.types";
import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import type { Job } from "@shared/types";

interface UseJobsProps {
  isQueryEnabled?: boolean;
  defaultPrismaQuery?: PrismaQueryOptions<Job>;
  pageSize?: number;
  config?: MutationConfigMap<"createJob" | "updateJob" | "deleteJob">;
}
