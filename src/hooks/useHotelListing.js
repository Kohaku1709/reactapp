import { useMemo } from "react";
import { filterHotels, sortHotels } from "../utils/hotelQuery";

/**
 * Hook dùng chung cho Home/Hotels để giữ pipeline dữ liệu nhất quán:
 * raw -> filter -> sort -> paginate.
 */
export default function useHotelListing({
  hotelList,
  activeFilter,
  sortBy,
  visibleRows,
  gridColumns,
  filterOptions,
  extraFilter,
}) {
  const filteredHotels = useMemo(() => {
    const baseFiltered = filterHotels(hotelList, activeFilter, filterOptions);
    if (!extraFilter) return baseFiltered;
    return baseFiltered.filter(extraFilter);
  }, [hotelList, activeFilter, filterOptions, extraFilter]);

  const sortedHotels = useMemo(
    () => sortHotels(filteredHotels, sortBy),
    [filteredHotels, sortBy],
  );

  const visibleCount = visibleRows * gridColumns;

  const visibleHotels = useMemo(
    () => sortedHotels.slice(0, visibleCount),
    [sortedHotels, visibleCount],
  );

  const hasMoreHotels = visibleHotels.length < sortedHotels.length;

  return {
    filteredHotels,
    sortedHotels,
    visibleHotels,
    hasMoreHotels,
  };
}
