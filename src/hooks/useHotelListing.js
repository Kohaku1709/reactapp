import { useMemo } from "react";
import { filterHotels, sortHotels } from "../utils/hotelQuery";

// Custom Hook tạo luồng xử lý dữ liệu khách sạn (Pipeline) thống nhất:
// Dữ liệu thô (raw data) -> Lọc theo tiêu chí (Filter) -> Sắp xếp (Sort) -> Phân trang hiển thị (Paginate)
// Việc dùng useMemo giúp tránh việc tính toán lại vô ích mỗi khi component re-render
export default function useHotelListing({
  hotelList,      // Mảng danh sách khách sạn gốc
  activeFilter,   // Bộ lọc đang chọn ("Tất cả", "5 sao", "Có hồ bơi"...)
  sortBy,         // Tiêu chí sắp xếp ("price-asc", "promotion"...)
  visibleRows,    // Số hàng khách sạn muốn hiển thị
  gridColumns,    // Số cột của lưới hiện tại (để tính tổng số card hiển thị)
  filterOptions,  // Ngưỡng lọc giá thấp/đánh giá cao
  extraFilter,    // Bộ lọc tùy biến thêm (nếu có, ví dụ lọc theo địa chỉ)
}) {
  // 1. Áp dụng bộ lọc (Filter) dữ liệu
  const filteredHotels = useMemo(() => {
    const baseFiltered = filterHotels(hotelList, activeFilter, filterOptions);
    if (!extraFilter) return baseFiltered;
    // Nếu có bộ lọc phụ extraFilter (như địa chỉ), tiếp tục lọc thêm một lần nữa
    return baseFiltered.filter(extraFilter);
  }, [hotelList, activeFilter, filterOptions, extraFilter]);

  // 2. Sắp xếp (Sort) dữ liệu sau khi lọc  
  const sortedHotels = useMemo(
    () => sortHotels(filteredHotels, sortBy),
    [filteredHotels, sortBy],
  );

    // Tính tổng số lượng khách sạn tối đa được phép hiển thị trên màn hình hiện tại
  const actualFullRows = Math.floor(sortedHotels.length / gridColumns);
  const visibleCount = Math.min(visibleRows, actualFullRows) * gridColumns;


  // 3. Phân trang cắt mảng (Paginate) để lấy danh sách khách sạn hiển thị thực tế
  const visibleHotels = useMemo(
    () => sortedHotels.slice(0, visibleCount),
    [sortedHotels, visibleCount],
  );

  // Kiểm tra xem có còn khách sạn nào khác để hiển thị thêm hay không (để hiện nút "Xem thêm")
  const hasMoreHotels = visibleHotels.length < sortedHotels.length;

  return {
    filteredHotels, // Danh sách sau khi lọc (dùng hiển thị tổng số kết quả tìm thấy)
    sortedHotels,   // Danh sách sau khi lọc và sắp xếp
    visibleHotels,  // Danh sách cắt lát thực tế hiển thị trên UI
    hasMoreHotels,  // Trạng thái còn dữ liệu hay không
  };
}
