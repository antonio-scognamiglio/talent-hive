/**
 * PaginationWrapperStyled Component
 *
 * Styled wrapper for PaginationWrapper with common default configurations.
 * Reduces verbosity in pages that always use the same configurations.
 *
 * Defaults:
 * - controlsConfig: { showControlsTop: false, showControlsBottom: true }
 * - pageSizeConfig: { label: "Per page", pageSizes: [25, 50, 100] }
 * - totalItemsConfig: { display: "badge", showTotalLabel: true }
 */

import { PAGE_SIZES_ARRAY, type PageSize } from "../constants/page-sizes";
import {
  PaginationWrapper,
  type PaginationWrapperProps,
} from "./PaginationWrapper";

type PaginationWrapperStyledProps<T> = Omit<
  PaginationWrapperProps<T>,
  "controlsConfig" | "pageSizeConfig" | "totalItemsConfig"
> & {
  /**
   * Override for controlsConfig (optional, has defaults)
   */
  controlsConfig?: Partial<PaginationWrapperProps<T>["controlsConfig"]>;
  /**
   * Configuration for PageSizeSelect (REQUIRED)
   * Must include value and onValueChange to always show the selector
   */
  pageSizeConfig: {
    value: PageSize;
    onValueChange: (value: number) => void;
    label?: string; // Optional, default: "Per page"
  };
  /**
   * Configuration for totalItems (optional, has defaults)
   * Pass singular/plural text directly or use a label function
   */
  totalItemsConfig?: {
    totalItems: number;
    /**
     * Singular text (e.g., "item")
     */
    singularText: string;
    /**
     * Plural text (e.g., "items")
     */
    pluralText: string;
    /**
     * Override for display (default: "badge")
     */
    display?: "badge" | "text" | false;
    /**
     * Override for showTotalLabel (default: true)
     */
    showTotalLabel?: boolean;
  };
};

/**
 * PaginationWrapperStyled - Wrapper with common default configurations
 */
export function PaginationWrapperStyled<T>({
  pageSizeConfig,
  totalItemsConfig,
  controlsConfig,
  ...restProps
}: PaginationWrapperStyledProps<T>) {
  // Default for controlsConfig
  const defaultControlsConfig: PaginationWrapperProps<T>["controlsConfig"] = {
    showControlsTop: false,
    showControlsBottom: true,
    showIntegratedLayout: true,
    integratedLayoutPosition: "top",
    ...controlsConfig,
  };

  // pageSizeConfig is required
  // Convert PAGE_SIZES_ARRAY (readonly) to number[] for PaginationWrapper
  const defaultPageSizeConfig: PaginationWrapperProps<T>["pageSizeConfig"] = {
    label: pageSizeConfig.label || "Per page",
    pageSizes: [...PAGE_SIZES_ARRAY], // Convert readonly array to number[]
    value: pageSizeConfig.value, // PageSize is compatible with number
    onValueChange: pageSizeConfig.onValueChange,
  };

  // Default for totalItemsConfig
  const defaultTotalItemsConfig: PaginationWrapperProps<T>["totalItemsConfig"] =
    totalItemsConfig
      ? {
          totalItems: totalItemsConfig.totalItems,
          display: totalItemsConfig.display ?? "badge",
          showTotalLabel: totalItemsConfig.showTotalLabel,
          label: (count) =>
            `${count} ${
              count === 1
                ? totalItemsConfig.singularText
                : totalItemsConfig.pluralText
            }`,
        }
      : undefined;

  return (
    <PaginationWrapper<T>
      {...restProps}
      controlsConfig={defaultControlsConfig}
      pageSizeConfig={defaultPageSizeConfig}
      totalItemsConfig={defaultTotalItemsConfig}
    />
  );
}
