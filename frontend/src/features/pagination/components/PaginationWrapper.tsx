/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { PaginationControls } from "./PaginationControls";
import { PageSizeSelect } from "./PageSizeSelect";
import { Badge } from "@/components/ui/badge";
import { usePaginationForGen } from "../hooks/usePaginationForGen";
import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import type { PaginatedResponse } from "@/features/shared/types/pagination.types";
import { PAGE_SIZES } from "../constants/page-sizes";
import type { ApiFunctionForGen } from "@/features/shared/types/api.types";
import { cn } from "@/lib/utils";
import type { QueryKeyFactory } from "@/features/shared/types/queryKeys.types";

export type PaginationPosition = "top" | "bottom" | "both" | false;

export interface ControlsConfig {
  /**
   * Show pagination controls above content
   * @default false
   */
  showControlsTop?: boolean;
  /**
   * Show pagination controls below content
   * @default true
   */
  showControlsBottom?: boolean;
  /**
   * Show PageSizeSelect above content
   * @default false
   */
  showPageSizeTop?: boolean;
  /**
   * Show PageSizeSelect below content
   * @default false
   */
  showPageSizeBottom?: boolean;
  /**
   * Integrated layout: horizontal layout with PageSizeSelect, PaginationControls, and totalItems
   * If true, shows this layout instead of separate controls
   * @default false
   */
  showIntegratedLayout?: boolean;
  /**
   * Position of integrated layout (top/bottom/both/false)
   * - "top": only above content
   * - "bottom": only below content
   * - "both": both above and below content
   * - false: don't show
   * @default "top"
   */
  integratedLayoutPosition?: PaginationPosition;
  /**
   * Integrated layout variant that determines position of PageSizeSelect and totalItems
   * - "selectLeftItemsRight": PageSizeSelect on left, totalItems on right (default)
   * - "itemsLeftSelectRight": totalItems on left, PageSizeSelect on right
   * @default "selectLeftItemsRight"
   */
  integratedLayoutVariant?: "itemsLeftSelectRight" | "selectLeftItemsRight";
}

// Base QueryStateProps (without error for backward compatibility)
interface QueryStateProps<T> {
  data: T[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  // refetch can be typed or a simple function that refetches
  refetch?: (
    options?: RefetchOptions,
  ) =>
    | Promise<QueryObserverResult<PaginatedResponse<T>, Error>>
    | Promise<unknown>
    | void;
}

interface PaginationWrapperWithHookGenProps<T, TBody = any, TPath = any> {
  apiFunction: ApiFunctionForGen<any, TBody, TPath>;
  pathParams?: Record<string, any>;
  prismaQuery?: PrismaQueryOptions<T>;
  pageSize?: number;
  initialPage?: number;
  enabled?: boolean;
  validateData?: (data: T[]) => boolean;
  onError?: (error: Error) => void;
  cacheDisabled?: boolean;
  skipDataLog?: boolean;
  children: (props: QueryStateProps<T>) => React.ReactNode;
  controlsConfig?: ControlsConfig;
  queryKeyFactory: QueryKeyFactory;
}

export const PaginationWrapperWithHookGen = <T, TBody = any, TPath = any>({
  children,
  apiFunction,
  pathParams,
  prismaQuery,
  pageSize = PAGE_SIZES.DEFAULT_PAGE_SIZE,
  initialPage = 1,
  enabled = true,
  validateData,
  onError,
  cacheDisabled = false,
  skipDataLog = true,
  controlsConfig = {
    showControlsTop: true,
    showControlsBottom: true,
  },
  queryKeyFactory,
}: PaginationWrapperWithHookGenProps<T, TBody, TPath>) => {
  const {
    data,
    isLoading,
    isError,
    error,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    handlePageClick,
    refetch,
  } = usePaginationForGen<T, TBody>({
    apiFunction,
    pathParams,
    pageSize,
    initialPage,
    prismaQuery,
    enabled,
    validateData: validateData ?? ((data) => Array.isArray(data)),
    onError,
    cacheDisabled,
    skipDataLog,
    queryKeyFactory,
  });

  return (
    <PaginationWrapper
      isError={isError}
      refetch={refetch}
      data={data}
      isLoading={isLoading}
      error={error}
      currentPage={currentPage}
      totalPages={totalPages}
      nextPage={nextPage}
      prevPage={prevPage}
      handlePageClick={handlePageClick}
      children={children}
      controlsConfig={controlsConfig}
    />
  );
};

export interface PaginationWrapperProps<T> extends Omit<
  QueryStateProps<T>,
  "refetch"
> {
  currentPage: number;
  totalPages: number;
  nextPage: () => void;
  prevPage: () => void;
  handlePageClick: (page: number) => void;
  children: (props: QueryStateProps<T>) => React.ReactNode;
  controlsConfig?: ControlsConfig;
  className?: string;
  refetch?: (
    options?: RefetchOptions,
  ) =>
    | Promise<QueryObserverResult<PaginatedResponse<T>, Error>>
    | Promise<unknown>
    | void;
  /**
   * Configuration for PageSizeSelect (optional)
   */
  pageSizeConfig?: {
    pageSizes: number[];
    value: number;
    onValueChange: (value: number) => void;
    label?: string;
    triggerWidth?: string;
  };
  /**
   * Configuration for totalItems (optional)
   */
  totalItemsConfig?: {
    totalItems: number;
    /**
     * Display type: "badge" (blue badge), "text" (simple text), or false (don't show)
     * @default "text"
     */
    display?: "badge" | "text" | false;
    /**
     * Custom label for text/badge
     * If not provided, uses default format
     */
    label?: (count: number) => string;
    /**
     * Add "total" to badge (only for display="badge")
     * @default false
     */
    showTotalLabel?: boolean;
    /**
     * Show or hide totalItems
     * @default true
     */
    showTotalItems?: boolean;
  };
}

export const PaginationWrapper = <T,>({
  data,
  isLoading,
  isError,
  currentPage,
  totalPages,
  nextPage,
  prevPage,
  handlePageClick,
  children,
  controlsConfig = {
    showControlsTop: false,
    showControlsBottom: true,
    showPageSizeTop: false,
    showPageSizeBottom: false,
    showIntegratedLayout: true,
    integratedLayoutPosition: "top",
  },
  refetch,
  className,
  error,
  pageSizeConfig,
  totalItemsConfig,
}: PaginationWrapperProps<T>) => {
  const renderProps = {
    data,
    isLoading,
    isError,
    error,
    refetch,
  };

  const {
    showControlsTop = false,
    showControlsBottom = true,
    showPageSizeTop = false,
    showPageSizeBottom = false,
    showIntegratedLayout = true,
    integratedLayoutPosition = "top",
    integratedLayoutVariant = "selectLeftItemsRight",
  } = controlsConfig;

  // Integrated layout: totalItems badge on left, PaginationControls in center, PageSizeSelect on right
  const renderIntegratedLayout = () => {
    if (!showIntegratedLayout || !integratedLayoutPosition) return null;

    // If neither pageSizeConfig nor totalItemsConfig, show only controls
    if (!pageSizeConfig && !totalItemsConfig) {
      return (
        <div className="flex justify-center">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onNextPage={nextPage}
            onPrevPage={prevPage}
            onPageClick={handlePageClick}
          />
        </div>
      );
    }

    // Render totalItems (badge or text)
    const renderTotalItems = () => {
      if (!totalItemsConfig) return null;

      const {
        totalItems,
        display = "text",
        label,
        showTotalLabel = false,
        showTotalItems = true,
      } = totalItemsConfig;

      if (!showTotalItems || display === false) return null;

      const displayText = label
        ? label(totalItems)
        : `${totalItems} ${totalItems === 1 ? "item" : "items"}`;

      const finalText = showTotalLabel
        ? `${displayText} ${totalItems === 1 ? "total" : "total"}`
        : displayText;

      if (display === "badge") {
        return (
          <Badge variant="outline" className="py-2 rounded-md">
            {finalText}
          </Badge>
        );
      }

      return <div className="text-sm text-muted-foreground">{finalText}</div>;
    };

    const isSelectLeft = integratedLayoutVariant === "selectLeftItemsRight";

    return (
      <div className="flex items-center justify-between">
        {/* Left: PageSizeSelect or totalItems based on variant */}
        <div className="flex-1">
          {isSelectLeft ? (
            pageSizeConfig ? (
              <PageSizeSelect
                pageSizes={pageSizeConfig.pageSizes}
                value={pageSizeConfig.value}
                onValueChange={pageSizeConfig.onValueChange}
                label={pageSizeConfig.label}
                triggerWidth={pageSizeConfig.triggerWidth}
                className="flex items-center gap-2"
              />
            ) : (
              <div /> // Spacer to maintain layout
            )
          ) : (
            renderTotalItems()
          )}
        </div>

        {/* Center: PaginationControls */}
        <div className="flex-1 flex justify-center">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onNextPage={nextPage}
            onPrevPage={prevPage}
            onPageClick={handlePageClick}
          />
        </div>

        {/* Right: totalItems or PageSizeSelect based on variant */}
        <div className="flex-1 flex justify-end">
          {isSelectLeft ? (
            renderTotalItems()
          ) : pageSizeConfig ? (
            <PageSizeSelect
              pageSizes={pageSizeConfig.pageSizes}
              value={pageSizeConfig.value}
              onValueChange={pageSizeConfig.onValueChange}
              label={pageSizeConfig.label}
              triggerWidth={pageSizeConfig.triggerWidth}
              className="flex items-center gap-2"
            />
          ) : (
            <div /> // Spacer to maintain layout
          )}
        </div>
      </div>
    );
  };

  // Render standalone PageSizeSelect
  const renderPageSizeSelect = (position: "top" | "bottom") => {
    if (!pageSizeConfig) return null;
    if (position === "top" && !showPageSizeTop) return null;
    if (position === "bottom" && !showPageSizeBottom) return null;

    return (
      <PageSizeSelect
        pageSizes={pageSizeConfig.pageSizes}
        value={pageSizeConfig.value}
        onValueChange={pageSizeConfig.onValueChange}
        label={pageSizeConfig.label}
        triggerWidth={pageSizeConfig.triggerWidth}
        className="flex items-center gap-2"
      />
    );
  };

  // Render standalone PaginationControls
  const renderPaginationControls = (position: "top" | "bottom") => {
    if (position === "top" && !showControlsTop) return null;
    if (position === "bottom" && !showControlsBottom) return null;

    return (
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onNextPage={nextPage}
        onPrevPage={prevPage}
        onPageClick={handlePageClick}
      />
    );
  };

  const showIntegratedTop =
    showIntegratedLayout &&
    (integratedLayoutPosition === "top" || integratedLayoutPosition === "both");
  const showIntegratedBottom =
    showIntegratedLayout &&
    (integratedLayoutPosition === "bottom" ||
      integratedLayoutPosition === "both");

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Top section */}
      {showIntegratedTop && renderIntegratedLayout()}
      {!showIntegratedTop && renderPageSizeSelect("top")}
      {!showIntegratedTop && showControlsTop && renderPaginationControls("top")}

      {/* Content */}
      {children(renderProps)}

      {/* Bottom section */}
      {showIntegratedBottom && renderIntegratedLayout()}
      {!showIntegratedBottom &&
        showControlsBottom &&
        renderPaginationControls("bottom")}
      {!showIntegratedBottom && renderPageSizeSelect("bottom")}
    </div>
  );
};
