import { usePaginationForGen } from "@/features/pagination/hooks/usePaginationForGen";
import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import { usersService } from "@/features/shared/services/users.service";
import { PAGE_SIZES } from "@/features/pagination/constants/page-sizes";
import { queryKeys } from "@/features/shared/config/query-client.config";
import type { UserWithoutPassword } from "@shared/types";

export interface UseUsersProps {
  isQueryEnabled?: boolean;
  defaultPrismaQuery?: PrismaQueryOptions<UserWithoutPassword>;
  pageSize?: number;
}

/**
 * Hook to manage users list with pagination
 */
export const useUsers = ({
  isQueryEnabled = true,
  defaultPrismaQuery,
  pageSize = PAGE_SIZES.DEFAULT_PAGE_SIZE,
}: UseUsersProps = {}) => {
  const getUsersPaginatedQuery = usePaginationForGen<UserWithoutPassword>({
    pageSize,
    apiFunction: usersService.listUsers,
    prismaQuery: defaultPrismaQuery,
    enabled: isQueryEnabled,
    queryKeyFactory: queryKeys.users.list,
  });

  return {
    ...getUsersPaginatedQuery,
    users: getUsersPaginatedQuery.data,
  };
};
