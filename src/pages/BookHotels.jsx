import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../context/userContext";
import HotelCard from "../components/HotelCard";




export default function BookHotels() {
    const { currentUser } = useContext(UserContext);
    // useLocation là một hook của React Router
    // dùng để đọc “thông tin của URL hiện tại” và dữ liệu đính kèm lúc điều hướng.
    const location = useLocation();
    // ?. trả về hotel nếu location.state tồn tại và có trường hotel
    // ngược lại trả về undefined.
    const hotel = location.state?.hotel;

    

    return (
        <div className="booking-container">
            <h1>Đặt phòng khách sạn</h1>
            <p>Chào {currentUser?.name || "khách hàng"}!</p>

            {hotel ? (
                <div className="booking-hotel-form">
                    <div className="booking-hotel-card">
                        <HotelCard hotel={hotel} />
                    </div>
                    <div className="booking-form">
                        <h2>Thông tin đặt phòng</h2>
                        
                    </div>
                </div>
            ) : (
                <div>
                    <p>
                        Không có thông tin khách sạn để đặt phòng. Vui lòng quay lại
                    </p>
                    <div className="booking-backlink">
                        <Link to="/hotels">Trang danh sách khách sạn</Link>
                    </div>
                </div>
            )}
        </div>
    );
}