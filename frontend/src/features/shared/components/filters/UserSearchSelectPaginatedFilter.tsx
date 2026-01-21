import { useMemo, useEffect } from "react";
import { queryKeys } from "@/features/shared/config/query-client.config";
import { SearchableSelectPaginated } from "@/features/shared/components/search-selects/SearchableSelectPaginated";
import {
  useSearchableSelectPaginated,
  type UseSearchableSelectPaginatedConfig,
} from "@/features/shared/hooks/useSearchableSelectPaginated";
import { usersService } from "@/features/shared/services/users.service";
import type { UserWithoutPassword } from "@shared/types";
import type { StringKeys } from "@/features/shared/types/prismaQuery.types";

export type UserFilterValue = string | "all";

interface UserSearchSelectPaginatedFilterProps {
  value: UserFilterValue;
  onChange: (value: UserFilterValue) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function UserSearchSelectPaginatedFilter({
  value,
  onChange,
  placeholder = "Cerca utente...",
  className,
  disabled = false,
}: UserSearchSelectPaginatedFilterProps) {
  // Configurazione per la paginazione (lista generale)
  const paginationQueryOptions = useMemo(
    () => ({
      orderBy: {
        lastName: "asc" as const,
      },
    }),
    [],
  );

  // Configurazione per la ricerca
  const searchQueryOptions = useMemo(
    () => ({
      take: 50, // Limita i risultati della ricerca
      orderBy: {
        firstName: "asc" as const,
        lastName: "asc" as const,
      },
    }),
    [],
  );

  // Configurazione per l'hook
  const config: UseSearchableSelectPaginatedConfig<UserWithoutPassword> =
    useMemo(
      () => ({
        apiFunction: usersService.listUsers,
        searchFields: [
          "firstName",
          "lastName",
          "email",
        ] as StringKeys<UserWithoutPassword>[],
        paginationQueryOptions,
        searchQueryOptions,
        pageSize: 20,
        queryKeyFactory: queryKeys.users.list,
      }),
      [paginationQueryOptions, searchQueryOptions],
    );

  // Hook che gestisce tutta la logica
  const {
    selectedItem,
    query,
    setQuery,
    displayResults,
    isLoading,
    isLoadingMore,
    canLoadMore,
    loadMore,
    onSelect: hookOnSelect,
    onClear: hookOnClear,
    results, // Dall'extends di UseSearchableSelectReturn
    isSearching, // Dall'extends di UseSearchableSelectReturn
    isError,
    error,
    totalItems,
  } = useSearchableSelectPaginated<UserWithoutPassword>(config);

  // Trova l'utente selezionato per il display
  const selectedUser = useMemo(() => {
    if (value === "all" || !value) {
      return null;
    }
    // Cerca prima in selectedItem
    if (selectedItem && selectedItem.id === value) {
      return selectedItem;
    }
    // Cerca in displayResults
    return displayResults.find((u) => u.id === value) || null;
  }, [value, selectedItem, displayResults]);

  // Sincronizza selectedItem quando value cambia esternamente
  useEffect(() => {
    if (value === "all" || !value) {
      if (selectedItem) {
        hookOnClear();
      }
    } else if (selectedUser && selectedItem?.id !== value) {
      hookOnSelect(selectedUser);
    }
  }, [value, selectedUser, selectedItem, hookOnSelect, hookOnClear]);

  // Gestisce la selezione
  const handleSelect = (user: UserWithoutPassword) => {
    hookOnSelect(user);
    onChange(user.id);
  };

  const handleClear = () => {
    hookOnClear();
    onChange("all");
  };

  return (
    <SearchableSelectPaginated<UserWithoutPassword>
      // Props dall'hook
      selectedItem={selectedUser}
      query={query}
      setQuery={setQuery}
      displayResults={displayResults}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      canLoadMore={canLoadMore}
      loadMore={loadMore}
      results={results}
      isSearching={isSearching}
      isError={isError}
      error={error}
      totalItems={totalItems}
      // Handlers
      onSelect={handleSelect}
      onClear={handleClear}
      // Props
      value={value === "all" ? undefined : value}
      onChange={(id) => onChange(id || "all")}
      getItemId={(user) => user.id}
      placeholder={placeholder}
      disabled={disabled}
      displayFormatter={(user) => {
        if (!user) return "";
        return `${user.firstName} ${user.lastName}`;
      }}
      renderItem={(user) => (
        <div className="flex flex-col px-1">
          <span className="font-medium">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      )}
      emptyMessage="Nessun utente trovato"
      loadingMoreMessage="Caricando altri utenti..."
      className={className}
    />
  );
}
