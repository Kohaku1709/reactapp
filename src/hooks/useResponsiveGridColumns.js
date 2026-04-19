import { useEffect, useState } from "react";

const getGridColumnsByWidth = (width) => {
  if (width <= 768) return 1;
  if (width <= 1024) return 2;
  return 3;
};

export default function useResponsiveGridColumns() {
  const [gridColumns, setGridColumns] = useState(() =>
    typeof window === "undefined"
      ? 3
      : getGridColumnsByWidth(window.innerWidth),
  );

  useEffect(() => {
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
