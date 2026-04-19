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
