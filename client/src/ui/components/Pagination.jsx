import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../../lib/utils";

export default function Pagination({ currentPage, totalPages, totalCount, limit, onPageChange, onLimitChange }) {
  if (totalPages <= 1 && !onLimitChange) return null;

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = Math.min(maxVisible - 1, totalPages - 1);
      }
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - maxVisible + 2);
      }

      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
      <div className="flex items-center gap-2 text-sm text-[#605A57]">
        <span className="hidden sm:inline">Showing</span>
        <span className="font-medium text-[#37322F]">
          {totalCount === 0 ? 0 : (currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, totalCount)}
        </span>
        <span className="hidden sm:inline">of</span>
        <span className="font-medium text-[#37322F]">{totalCount}</span>
        {onLimitChange && (
          <>
            <span className="mx-2">|</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-2 py-1 border border-[rgba(55,50,47,0.12)] rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#37322F]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {getVisiblePages().map((page, i) =>
          page === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2">
              <MoreHorizontal className="w-4 h-4 text-[#605A57]" />
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(page)}
              className={cn("h-8 w-8", currentPage === page && "bg-[#37322F] text-white hover:bg-[#37322F]/90")}
            >
              {page}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
