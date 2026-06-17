import { useEffect, useState } from "react";

// Hàm ánh xạ từ chiều rộng màn hình (pixels) sang số cột hiển thị tương ứng
// - Dưới 768px (Mobile): Hiển thị 1 cột (dọc)
// - Từ 768px đến 1024px (Tablet): Hiển thị 2 cột
// - Trên 1024px (Desktop): Hiển thị 3 cột
const getGridColumnsByWidth = (width) => {
  if (width <= 768) return 1;
  if (width <= 1024) return 2;
  return 3;
};

// Custom Hook theo dõi sự thay đổi kích thước của cửa sổ trình duyệt (window resize)
// Giúp layout lưới của khách sạn co giãn mượt mà và trực quan (Responsive)
export default function useResponsiveGridColumns() {
  // Khởi tạo số cột ban đầu dựa trên chiều rộng hiện tại của trình duyệt
  const [gridColumns, setGridColumns] = useState(() =>
    typeof window === "undefined"
      ? 3
      : getGridColumnsByWidth(window.innerWidth),
  );

  useEffect(() => {
    // Hàm callback chạy mỗi khi người dùng resize trình duyệt
    const handleResize = () => {
      const nextColumns = getGridColumnsByWidth(window.innerWidth);
      // Chỉ cập nhật state nếu số cột thực sự thay đổi (tránh re-render thừa)
      setGridColumns((prevColumns) =>
        prevColumns === nextColumns ? prevColumns : nextColumns,
      );
    };

    // Lắng nghe sự kiện resize với tùy chọn passive để tăng hiệu suất cuộn/vẽ
    window.addEventListener("resize", handleResize, { passive: true });
    handleResize(); // Chạy thử 1 lần ngay sau khi mount để đảm bảo kích thước chính xác

    // Hủy lắng nghe sự kiện khi Component bị unmount để tránh rò rỉ bộ nhớ (memory leak)
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return gridColumns;
}
