import { useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number | undefined;
  onNextPage: () => void;
  onPrevPage: () => void;
  onPageClick: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
  onPageClick,
}) => {
  const getPageNumbers = useMemo(() => {
    if (!totalPages || totalPages <= 1) return [];

    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // If we have 5 or fewer pages, show them all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include the first page
      pages.push(1);

      // Calculate start and end of visible pages around current
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're at the beginning or end
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }

      // Add ellipsis after page 1 if needed
      if (startPage > 2) {
        pages.push("ellipsis-start");
      }

      // Add visible pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      // Always include the last page
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  if (!totalPages || totalPages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            currentPage={currentPage}
            totalPages={totalPages || 1}
            onClick={onPrevPage}
            size="default"
          />
        </PaginationItem>

        {getPageNumbers.map((page) => {
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <PaginationItem key={`ellipsis-${page}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={`page-${page}`}>
              <PaginationLink
                onClick={() => onPageClick(page as number)}
                isActive={currentPage === page}
                size="default"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            currentPage={currentPage}
            totalPages={totalPages || 1}
            onClick={onNextPage}
            size="default"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export { PaginationControls };
