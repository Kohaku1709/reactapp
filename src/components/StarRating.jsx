// Component hiển thị đánh giá số sao của khách sạn (ví dụ: 1 đến 5 sao)
// - count: Số lượng sao màu vàng được tô đầy (filled)
export default function StarRating({ count }) {
    return (
        <span className="stars">
            {/* Tạo một mảng giả lập có 5 phần tử để render ra 5 ngôi sao */}
            {Array.from({ length: 5 }).map((_, i) => (
                // Nếu chỉ số nhỏ hơn count thì gán class "star filled" (màu vàng), ngược lại gán "star" (màu xám)
                <span key={i} className={i < count ? "star filled" : "star"}>
                    ★
                </span>
            ))}
        </span>
    );
}
