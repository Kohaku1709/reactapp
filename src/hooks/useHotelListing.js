import { useMemo } from "react";
import { filterHotels, sortHotels } from "../utils/hotelQuery";

// Called by: HomePage và HotelsPage.
// Params:
// - hotelList: mảng hotel gốc
// - activeFilter: một giá trị trong HOTEL_FILTERS
// - sortBy: một value trong HOTEL_SORT_OPTIONS
// - visibleRows: số dòng hiển thị (số nguyên dương)
// - gridColumns: số cột (1|2|3)
// - filterOptions: object ngưỡng lọc
// - extraFilter: function(hotel)=>boolean hoặc undefined
// Output: { filteredHotels, sortedHotels, visibleHotels, hasMoreHotels }.
// Does: tạo pipeline dữ liệu nhất quán: filter -> sort -> paginate.
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
