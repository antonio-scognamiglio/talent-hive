import type { Job } from "@shared/types";

/**
 * Job con conteggio delle relazioni (applications, ecc.)
 * Usato quando si include `_count` nella query Prisma
 */
export type JobWithCount = Job & {
  _count: {
    applications: number;
  };
};
