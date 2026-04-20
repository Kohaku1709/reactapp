import { useEffect, useState } from "react";

// Called by: useResponsiveGridColumns và handleResize.
// Params: width. Accepted values: số pixel >= 0.
// Output: số cột grid 1|2|3.
// Does: map kích thước màn hình sang mật độ hiển thị card.
const getGridColumnsByWidth = (width) => {
  if (width <= 768) return 1;
  if (width <= 1024) return 2;
  return 3;
};

// Called by: HomePage/HotelsPage.
// Params: không có.
// Output: gridColumns hiện tại (1|2|3).
// Does: lắng nghe resize và cập nhật số cột khi breakpoint thay đổi.
export default function useResponsiveGridColumns() {
  const [gridColumns, setGridColumns] = useState(() =>
    typeof window === "undefined"
      ? 3
      : getGridColumnsByWidth(window.innerWidth),
  );

  useEffect(() => {
    // Called by: browser resize event + lần gọi thủ công sau khi mount.
    // Params: không dùng trực tiếp event object.
    // Output: state gridColumns mới nếu breakpoint thay đổi.
    // Does: tránh setState dư thừa khi số cột không đổi.
    const handleResize = () => {
      const nextColumns = getGridColumnsByWidth(window.innerWidth);
      setGridColumns((prevColumns) =>
        prevColumns === nextColumns ? prevColumns : nextColumns,
      );
    };

    window.addEventListener("resize", handleResize, { passive: true });
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return gridColumns;
}
