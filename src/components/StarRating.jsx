// Called by: HotelCard.
// Params: count. Accepted values: số nguyên từ 0 đến 5.
// Output: 5 biểu tượng sao, trong đó count sao được tô (filled).
// Does: map mảng độ dài 5 để render trạng thái sao theo rating.
export default function StarRating({ count }) {
    return (
        <span className="stars">
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < count ? "star filled" : "star"}>
                    ★
                </span>
            ))}
        </span>
    );
}
