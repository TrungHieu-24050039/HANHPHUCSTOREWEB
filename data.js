// data.js

/**
 * MOCKUP DATABASE & APPLICATION STATE
 */

// Dữ liệu giả lập
const MOCK_DATA = {
    teamIntro: 'Chào mừng đến với BookVerse Pro! Chúng tôi là một đội ngũ đam mê sách, mong muốn kết nối những tác phẩm tuyệt vời đến với độc giả. Với sự kết hợp giữa công nghệ và tình yêu văn học, chúng tôi cam kết mang đến trải nghiệm mua sắm sách trực tuyến tốt nhất.',
    members: {
        member1: { name: 'Dương Công Danh', role: '', dob: '04/12/2006', hometown: 'Đồng Tháp', hobby: 'Chơi game, đá bóng', facebook: 'https://www.facebook.com/share/1MEaC9Ugoi/', profileLink: 'https://24050028-danh.github.io/protfoliopro-danh/', img: 'images/danh.png' },
        member2: { name: 'Trần Tấn Tài', role: '', dob: '10/09/2005', hometown: 'Hậu Giang', hobby: 'Lập trình, AI', facebook: 'https://www.facebook.com/gak0nn', profileLink: 'https://24050029-art.github.io/portfolio-trantantai-/', img: 'images/tai.png' },
        member3: { name: 'Phạm Đức Lộc', role: '', dob: '04/06/2006', hometown: 'Đăk Lăk', hobby: 'Vẽ, UI/UX', facebook: 'https://www.facebook.com/share/1Bc5S1pin1/', profileLink: 'https://phamducloc55203-ctrl.github.io/portfolio/', img: 'images/loc.png' },
        member4: { name: 'Nguyễn Hoàng Trung Hiếu', role: '', dob: '19/10/2005', hometown: 'Đồng Nai', hobby: 'Lập trình game', facebook: 'https://www.facebook.com/share/1JgL4JoVJ3/?mibextid=wwXIfr', profileLink: 'https://trunghieu-24050039.github.io/NguyenHoangTrungHieu---24050039/', img: 'images/hieu.png' },
        member5: { name: 'Huỳnh Tấn Hưng', role: '', dob: '04/12/2006', hometown: 'Bình Dương', hobby: 'Chơi game', facebook: 'https://www.facebook.com/share/1DfPUGLuei/?mibextid=wwXIfr', profileLink: 'https://24050004-stack.github.io/HuynhTanHung--24050039/', img: 'images/hung.png' },
    },
    books: [
        { id: '1', title: 'Siêu Giảm Giá: Tôi Thấy Hoa Vàng Trên Cỏ Xanh', price: 120000, sale_price: 60000, discount: 50, desc: 'Tác phẩm lãng mạn của NNA (Giá gốc 120.000 VNĐ). Truyện kể về tuổi thơ và những ký ức đẹp đẽ ở một vùng quê Việt Nam.', img: 'images/hoavang.jpg', category: 'hot' },
        { id: '2', title: 'Ưu Đãi Sốc: Hoàng Tử Bé', price: 85000, sale_price: 42500, discount: 50, desc: 'Truyện thiếu nhi kinh điển (Giá gốc 85.000 VNĐ). Một câu chuyện đầy triết lý về tình bạn, tình yêu và ý nghĩa cuộc sống.', img: 'images/hoangtu.jpg', category: 'hot' },
        { id: '3', title: 'Đắc Nhân Tâm - Giảm Nửa Giá', price: 150000, sale_price: 75000, discount: 50, desc: 'Sách kỹ năng bán chạy nhất (Giá gốc 150.000 VNĐ). Cuốn sách hướng dẫn cách đối nhân xử thế, làm chủ các mối quan hệ xã hội.', img: 'images/dacnhantam.jpg', category: 'hot' },
        { id: '4', title: 'Atomic Habits', price: 200000, desc: 'Nâng cấp bản thân mỗi ngày. Hướng dẫn xây dựng thói quen tốt và loại bỏ thói quen xấu để đạt được những thành tựu lớn.', img: 'images/atomic.jpg', category: 'new' },
        { id: '5', title: 'Bí Mật của Nước', price: 90000, desc: 'Sách khoa học đời sống. Khám phá những điều kỳ diệu và bí ẩn của phân tử nước trong tự nhiên và cơ thể con người.', img: 'images/nuoc.jpg', category: 'suggest' },
        { id: '6', title: 'Cây Cam Ngọt', price: 110000, desc: 'Văn học nước ngoài. Câu chuyện xúc động về cậu bé Zeze với trí tưởng tượng phong phú và những nỗi đau đầu đời.', img: 'images/caycamngot.jpg', category: 'new' },
        { id: '7', title: '7 Thói Quen', price: 180000, desc: 'Kinh doanh & Phát triển. Tóm tắt 7 thói quen hiệu quả để trở thành người thành công và có ảnh hưởng trong cuộc sống.', img: 'images/thoiquen.jpg', category: 'best' },
        { id: '8', title: 'Thiên Tài Bên Trong', price: 130000, desc: 'Sách tâm lý học. Hướng dẫn khai phá tiềm năng ẩn giấu và tối ưu hóa khả năng tư duy của mỗi người.', img: 'images/thientai.jpg', category: 'suggest' },
        { id: '9', title: 'Thế Giới Phẳng', price: 220000, desc: 'Kinh tế toàn cầu. Phân tích về sự thay đổi của thế giới trong kỷ nguyên số hóa và toàn cầu hóa.', img: 'images/thegioi.jpg', category: 'new' },
        { id: '10', title: 'Harry Potter 1', price: 250000, desc: 'Truyện phiêu lưu kỳ ảo. Tập đầu tiên của loạt truyện kinh điển về thế giới phù thủy.', img: 'images/harry1.jpg', category: 'suggest' },
    ]
};

// Trạng thái ứng dụng
let appState = {
    currentPage: 'home',
    currentPageParams: {}, // Để chứa các tham số như id sách
    cart: [], 
    favorites: [], // ['1', '3']
    user: null, // { name: '...', email: '...' }
    lastOrder: null, 
    searchQuery: null // Thêm trạng thái tìm kiếm
};

// Danh sách các trang và liên kết nav
const ROUTES = {
    home: { title: 'Trang Chủ', nav: true, render: 'renderHomePage' }, 
    shop: { title: 'Cửa Hàng', nav: true, render: 'renderShopPage' },
    favorites: { title: 'Yêu Thích', nav: true, render: 'renderFavoritesPage' }, 
    about: { title: 'Về Chúng Tôi', nav: true, render: 'renderAboutPage' },
    tracking: { title: 'Theo Dõi Đơn Hàng', nav: true, render: 'renderTrackingPage' }, 

    // Các trang không hiển thị trên Nav chính
    cart: { title: 'Giỏ Hàng', nav: false, render: 'renderCartPage' },
    checkout: { title: 'Thanh Toán', nav: false, render: 'renderCheckoutPage' },
    bookDetail: { title: 'Chi Tiết Sách', nav: false, render: 'renderBookDetailPage' }, 
};