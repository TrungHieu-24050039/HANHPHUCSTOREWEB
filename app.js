// app.js

/**
 * GLOBAL APPLICATION OBJECT (Tạo namespace APP để tránh xung đột)
 */
const APP = {
    carouselInterval: null, 

    // --- MODULE: CORE ---
    init() {
        // Tải trạng thái từ Local Storage (giả lập)
        APP.Core.loadAppState();
        
        window.addEventListener('hashchange', APP.Core.router);
        document.body.addEventListener('click', APP.Core.handlePageNavigation);
        
        // Gắn sự kiện đóng modal khi click ra ngoài
        document.getElementById('modal-container').onclick = (e) => { 
            if (e.target.id === 'modal-container') APP.Utils.closeModal(); 
        };
        
        // Gắn sự kiện tìm kiếm
        document.getElementById('search-form').onsubmit = APP.Core.handleSearch;

        APP.Core.router(); 
        APP.Renderer.renderNav(); 
        APP.Auth.renderUserStatus();
    },

    Core: {
        loadAppState() {
             const storedState = localStorage.getItem('appState');
             if (storedState) {
                 const state = JSON.parse(storedState);
                 // Chỉ khôi phục các trạng thái cần thiết (Giỏ hàng, Yêu thích, User, Đơn hàng cuối cùng)
                 appState.cart = state.cart || [];
                 appState.favorites = state.favorites || [];
                 appState.user = state.user || null;
                 appState.lastOrder = state.lastOrder || null; // KHẮC PHỤC THEO DÕI ĐƠN HÀNG
             }
        },
        saveAppState() {
            localStorage.setItem('appState', JSON.stringify(appState));
        },
        
        router() {
            // Dừng carousel cũ nếu chuyển trang
            if (APP.carouselInterval) {
                clearInterval(APP.carouselInterval);
                APP.carouselInterval = null;
            }
            
            const hash = window.location.hash.substring(1);
            let page = 'home';
            let params = {}; // Để chứa tham số như id sách

            // Xử lý route có tham số (ví dụ: book/123)
            if (hash.startsWith('book/')) {
                page = 'bookDetail';
                params.id = hash.split('/')[1];
            } else {
                 page = ROUTES[hash] ? hash : (hash === '' ? 'home' : 'home');
            }
            
            appState.currentPage = page;
            appState.currentPageParams = params; // Lưu tham số trang
            
            // Xóa trạng thái tìm kiếm nếu không ở trang shop
            if (page !== 'shop') {
                appState.searchQuery = null;
            }
            
            APP.Renderer.renderApp();
        },
        
        handlePageNavigation(e) {
            let target = e.target.closest('[data-page]');
            if (target) {
                if (target.getAttribute('data-page') === 'cart') return;
                
                e.preventDefault();
                const pageId = target.getAttribute('data-page');
                window.location.hash = pageId;
            }
        },
        
        // CẬP NHẬT: Xử lý tìm kiếm để lọc sách và chuyển sang trang shop
        handleSearch(e) {
            e.preventDefault();
            const query = document.getElementById('search-input').value.trim();
            if (query) {
                appState.searchQuery = query.toLowerCase();
                // Chuyển hướng đến trang shop để hiển thị kết quả
                window.location.hash = 'shop'; 
            } else {
                appState.searchQuery = null;
                if (appState.currentPage === 'shop') {
                    APP.Renderer.renderApp(); // Render lại trang shop nếu đang ở đó
                }
            }
        }
    },

    // --- MODULE: UTILS ---
    Utils: {
        formatCurrency(amount) {
            if (isNaN(amount) || amount === null) return '0 VNĐ'; 
            return amount.toLocaleString('vi-VN') + ' VNĐ';
        },
        findBook(id) {
            return MOCK_DATA.books.find(b => b.id === id);
        },
        updateCartCount() {
            const count = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('cart-count').textContent = count;
            APP.Core.saveAppState(); // Lưu trạng thái
        },
        openModal(contentHTML, title = 'Thông báo') {
            const modalBody = document.getElementById('modal-body');
            const modalTitle = document.getElementById('modal-title');
            
            modalTitle.textContent = title;
            modalBody.innerHTML = contentHTML;
            document.getElementById('modal-container').style.display = 'flex';
        },
        closeModal() {
            document.getElementById('modal-container').style.display = 'none';
            document.getElementById('modal-body').innerHTML = '';
        },
        calculateSelectedTotal() {
            return appState.cart
                .filter(item => item.selected)
                .reduce((sum, item) => sum + item.price * item.quantity, 0);
        }
    },

    // --- MODULE: AUTHENTICATION (Giữ nguyên) ---
    Auth: {
        renderUserStatus() {
            const userStatusArea = document.getElementById('user-status-area');
            if (appState.user) {
                userStatusArea.innerHTML = `
                    <span class="welcome-user" title="${appState.user.email}"><i class="fas fa-user-circle"></i> Xin chào, ${appState.user.name}</span>
                    <button class="status-btn" data-action="logout"><i class="fas fa-sign-out-alt"></i> Đăng xuất</button>
                `;
                document.querySelector('[data-action="logout"]').onclick = APP.Auth.handleLogout;
            } else {
                userStatusArea.innerHTML = `
                    <button class="btn-primary status-btn" data-action="login">Đăng nhập</button>
                `;
                document.querySelector('[data-action="login"]').onclick = () => APP.Auth.handleAuth('login');
            }
        },
        
        handleAuth(action) {
            const isLogin = action === 'login';
            const title = isLogin ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản Mới';
            const btnText = isLogin ? 'Đăng Nhập' : 'Đăng Ký';
            const switchAction = isLogin ? 'register' : 'login';
            const switchText = isLogin ? 'Bạn chưa có tài khoản? Đăng ký ngay' : 'Bạn đã có tài khoản? Đăng nhập';

            const contentHTML = `
                <form id="auth-form" data-mode="${action}">
                    ${!isLogin ? '<input type="text" id="auth-name" placeholder="Họ tên" required>' : ''}
                    <input type="email" id="auth-email" placeholder="Địa chỉ Email" required><br>
                    <input type="password" id="auth-password" placeholder="Mật khẩu" required><br>
                    ${!isLogin ? '<input type="password" id="auth-confirm-password" placeholder="Xác nhận Mật khẩu" required><br>' : ''}

                    <button type="submit" class="btn-primary" style="width: 100%; margin-top: 5px;">${btnText}</button>
                </form>
                <p class="auth-form-switch">
                    <a href="#" onclick="APP.Auth.handleAuth('${switchAction}'); return false;">${switchText}</a>
                </p>
            `;
            APP.Utils.openModal(contentHTML, title);
            
            // Gắn sự kiện cho form
            document.getElementById('auth-form').onsubmit = (e) => {
                e.preventDefault();
                
                const email = document.getElementById('auth-email').value;
                const password = document.getElementById('auth-password').value;
                
                // Giả lập Logic Validation
                if (!email || !password) {
                    alert('Vui lòng nhập đầy đủ Email và Mật khẩu.');
                    return;
                }
                
                if (!isLogin) {
                    const name = document.getElementById('auth-name').value;
                    const confirmPassword = document.getElementById('auth-confirm-password').value;
                    if (password !== confirmPassword) {
                        alert('Xác nhận mật khẩu không khớp.');
                        return;
                    }
                    if (!name) {
                        alert('Vui lòng nhập Họ tên.');
                        return;
                    }

                    // Giả lập Đăng ký thành công
                    appState.user = { name: name, email: email };
                    alert(`🎉 Đăng ký thành công! Chào mừng ${appState.user.name}.`);

                } else {
                    // Giả lập Đăng nhập thành công
                    const name = email.split('@')[0];
                    appState.user = { name: name, email: email };
                    alert(`✅ Đăng nhập thành công! Chào mừng ${appState.user.name}.`);
                }

                APP.Utils.closeModal();
                APP.Auth.renderUserStatus(); 
                APP.Core.saveAppState();
                window.location.hash = 'shop'; 
            };
        },
        handleLogout() {
            appState.user = null;
            appState.cart = appState.cart.filter(item => item.selected); 
            alert('Bạn đã đăng xuất thành công.');
            APP.Auth.renderUserStatus();
            APP.Core.saveAppState();
            window.location.hash = 'home';
        }
    },

    // --- MODULE: CART & ORDERS (Giữ nguyên logic giỏ hàng/thanh toán) ---
    Cart: {
        addToCart(id, quantity = 1) {
            const book = APP.Utils.findBook(id);
            const priceToUse = book.sale_price || book.price; 
            const existingItem = appState.cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                appState.cart.push({ id, price: priceToUse, quantity: quantity, selected: true }); 
            }
            APP.Utils.updateCartCount();
        },
        removeFromCart(id) {
            appState.cart = appState.cart.filter(item => item.id !== id);
            APP.Utils.updateCartCount();
            APP.Renderer.renderApp(); 
        },
        updateQuantity(id, change) {
            const item = appState.cart.find(item => item.id === id);
            if (item) {
                item.quantity += change;
                if (item.quantity < 1) item.quantity = 1;
            }
            APP.Renderer.renderApp();
        },
        toggleSelection(id) {
            const item = appState.cart.find(item => item.id === id);
            if (item) {
                item.selected = !item.selected;
            }
            APP.Renderer.renderApp();
        },
        
        placeOrder(formData) {
            const selectedItems = appState.cart.filter(item => item.selected);
            if (selectedItems.length === 0) {
                alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
                return;
            }
            
            const total = APP.Utils.calculateSelectedTotal();
            
            // LƯU ĐƠN HÀNG CUỐI CÙNG VÀO appState
            appState.lastOrder = {
                id: 'BK' + Date.now().toString().slice(-6),
                date: new Date().toLocaleDateString('vi-VN'),
                ...formData,
                total: total,
                items: selectedItems.map(item => ({...APP.Utils.findBook(item.id), quantity: item.quantity, finalPrice: item.price })),
            };
            
            // Xóa các sản phẩm đã được thanh toán khỏi giỏ hàng
            appState.cart = appState.cart.filter(item => !item.selected);
            
            APP.Utils.updateCartCount();
            APP.Core.saveAppState(); // LƯU VÀO LOCAL STORAGE
            alert(`ĐẶT HÀNG THÀNH CÔNG! Mã đơn hàng ${appState.lastOrder.id}.`);
            window.location.hash = 'tracking';
        }
    },
    
    // --- MODULE: CAROUSEL (Giữ nguyên) ---
    Carousel: {
        currentSlide: 0,
        init() {
            const books = MOCK_DATA.books.filter(b => b.category === 'hot');
            const track = document.getElementById('carousel-track');
            const totalSlides = books.length;
            
            if (!track) return; 
            
            APP.Carousel.currentSlide = 0; 
            
            const moveToSlide = (index) => {
                if (index >= totalSlides) index = 0;
                if (index < 0) index = totalSlides - 1;
                APP.Carousel.currentSlide = index;
                
                const slideElement = track.children[0];
                const slideWidth = slideElement ? slideElement.clientWidth : 0; 

                track.style.transform = `translateX(-${slideWidth * index}px)`;
                
                document.querySelectorAll('.dot').forEach((dot, i) => {
                    dot.classList.toggle('active', i === index);
                });
            };

            document.getElementById('next-slide').onclick = () => moveToSlide(APP.Carousel.currentSlide + 1);
            document.getElementById('prev-slide').onclick = () => moveToSlide(APP.Carousel.currentSlide - 1);
            
            document.querySelectorAll('.dot').forEach((dot, index) => {
                dot.onclick = () => moveToSlide(index);
            });

            if (APP.carouselInterval) clearInterval(APP.carouselInterval);
            APP.carouselInterval = setInterval(() => {
                moveToSlide(APP.Carousel.currentSlide + 1);
            }, 4000);
            
            moveToSlide(0); 
        }
    },


    // --- MODULE: RENDERING (VIEWS) ---
    Renderer: {
        renderNav() {
            const navList = document.getElementById('main-nav-list');
            let navHTML = '';
            for (const key in ROUTES) {
                if (ROUTES[key].nav) {
                    const isActive = appState.currentPage === key;
                    navHTML += `<li><a href="#${key}" class="${isActive ? 'nav-active' : ''}">${ROUTES[key].title}</a></li>`;
                }
            }
            navList.innerHTML = navHTML;
        },

        renderApp() {
            const container = document.getElementById('page-content');
            APP.Renderer.renderNav(); 
            
            let renderFunc = APP.Renderer[ROUTES[appState.currentPage]?.render];
            
            // Xử lý trang Chi tiết sách
            if (appState.currentPage === 'bookDetail') {
                renderFunc = APP.Renderer.renderBookDetailPage;
            }
            
            container.innerHTML = renderFunc ? renderFunc() : APP.Renderer.renderHomePage();
            APP.Renderer.attachPageEventListeners();
            APP.Utils.updateCartCount();
        },
        
        renderHomePage() {
            const hotBooks = MOCK_DATA.books.filter(b => b.category === 'hot');
            const carouselItems = hotBooks.map(book => {
                const finalPrice = APP.Utils.formatCurrency(book.sale_price);
                const originalPrice = APP.Utils.formatCurrency(book.price);
                return `
                    <div class="carousel-item" data-id="${book.id}">
                        <div class="carousel-content">
                            <span class="discount-tag">🔥 GIẢM ${book.discount}%</span>
                            <h2>${book.title}</h2>
                            <p style="margin-bottom: 20px;">${book.desc}</p>
                            
                            <div style="display: flex; align-items: baseline; margin-bottom: 20px;">
                                <span class="original-price">${originalPrice}</span>
                                <span class="current-price">${finalPrice}</span>
                            </div>

                            <a href="#book/${book.id}" class="btn-primary btn-detail-book">CHI TIẾT</a>
                            <button class="btn-primary btn-add-cart" style="background-color: #ff4500; margin-left: 10px;">MUA NGAY</button>
                        </div>
                        <div class="carousel-img">
                            <img src="${book.img}" alt="${book.title}">
                        </div>
                    </div>
                `;
            }).join('');
            
            const dotsHTML = hotBooks.map((_, index) => `<span class="dot ${index === 0 ? 'active' : ''}"></span>`).join('');

            const normalBooksHTML = MOCK_DATA.books.slice(3, 8).map(book => APP.Renderer.renderBookCard(book)).join('');

            return `
                <div class="carousel-container">
                    <div class="carousel-track" id="carousel-track">
                        ${carouselItems}
                    </div>
                    <button class="carousel-control" id="prev-slide"><i class="fas fa-chevron-left"></i></button>
                    <button class="carousel-control" id="next-slide"><i class="fas fa-chevron-right"></i></button>
                </div>
                <div class="carousel-dots">${dotsHTML}</div>

                <h2 style="margin-top: 40px;">Sách Nổi Bật Khác</h2>
                <div class="product-grid">${normalBooksHTML}</div>
            `;
        },
        
        renderBookDetailPage() {
            const bookId = appState.currentPageParams.id;
            const book = APP.Utils.findBook(bookId);
            
            if (!book) {
                 return `<h2>Sách không tồn tại</h2><p style="text-align:center; padding: 50px;">Quyển sách bạn tìm không có trong kho.</p>`;
            }
            
            const isFavorite = appState.favorites.includes(book.id);
            const finalPrice = book.sale_price || book.price;
            const priceDisplay = book.sale_price 
                ? `<span class="original-price" style="font-size: 1.2em;">${APP.Utils.formatCurrency(book.price)}</span> <span class="current-price" style="font-size: 2em; color: #ff4500; margin-left: 15px;">${APP.Utils.formatCurrency(book.sale_price)}</span>`
                : `<span class="current-price" style="font-size: 2em; color: #ff4500;">${APP.Utils.formatCurrency(book.price)}</span>`;

            return `
                <h2>📖 Chi Tiết Sách: ${book.title}</h2>
                <div class="book-detail-layout" data-id="${book.id}">
                    <div class="book-detail-img">
                        <img src="${book.img}" alt="${book.title}">
                    </div>
                    <div class="book-detail-info">
                        ${book.discount ? `<span class="discount-tag" style="font-size: 1.2em;">🔥 GIẢM ${book.discount}%</span>` : ''}
                        
                        <h1 style="color:#2c3e50; margin-top: 10px;">${book.title}</h1>
                        <p style="font-style: italic; color: #7f8c8d;">Tác giả: <a href="#">Giả lập A</a> | Thể loại: ${book.category}</p>

                        <div style="margin: 20px 0; padding: 15px; background: #fef0f0; border: 1px solid #fcd4d4; border-radius: 8px;">
                            <p style="margin: 0;">Giá bán:</p>
                            <div style="display: flex; align-items: baseline;">${priceDisplay}</div>
                        </div>

                        <p style="line-height: 1.6; margin-bottom: 30px;">${book.desc}. Đây là mô tả chi tiết hơn về sách, bao gồm tóm tắt nội dung và đánh giá sơ bộ từ ban biên tập. Sách sẽ giúp người đọc đạt được mục tiêu X, Y, Z...</p>

                        <div class="detail-actions">
                            <div class="quantity-control" style="width: 150px; display: inline-flex; margin-right: 20px;">
                                <button class="btn-qty-minus detail-qty">-</button>
                                <input type="number" id="detail-quantity" value="1" min="1" max="99" style="width: 50px; text-align: center; border: 1px solid #ddd; padding: 5px;" onchange="if(this.value < 1) this.value = 1;">
                                <button class="btn-qty-plus detail-qty">+</button>
                            </div>
                            <button class="btn-primary btn-add-cart" style="background-color: #ff4500; font-size: 1.1em; padding: 12px 25px;">
                                <i class="fas fa-cart-plus"></i> Thêm vào Giỏ
                            </button>
                            <i class="fas fa-heart heart-btn ${isFavorite ? 'liked' : ''}" style="font-size: 1.8em; margin-left: 20px;"></i>
                        </div>
                    </div>
                </div>
            `;
        },
        
        // CẬP NHẬT: Trang Shop có chức năng lọc/tìm kiếm
        renderShopPage() {
            let filteredBooks = MOCK_DATA.books;
            let title = '📖 Cửa Hàng Sách';
            
            if (appState.searchQuery) {
                filteredBooks = MOCK_DATA.books.filter(book => 
                    book.title.toLowerCase().includes(appState.searchQuery) || 
                    book.desc.toLowerCase().includes(appState.searchQuery)
                );
                title = `📚 Kết Quả Tìm Kiếm cho: "${appState.searchQuery}" (${filteredBooks.length} sách)`;
            }
            
            const booksHTML = filteredBooks.map(book => APP.Renderer.renderBookCard(book)).join('');
            
            let content = '';
            if (filteredBooks.length > 0) {
                content = `<div class="product-grid">${booksHTML}</div>`;
            } else if (appState.searchQuery) {
                content = `<p style="text-align:center; padding: 50px;">Không tìm thấy sách nào khớp với từ khóa: "${appState.searchQuery}". Vui lòng thử từ khóa khác.</p>`;
            } else {
                 content = `<p style="text-align:center; padding: 50px;">Cửa hàng hiện tại đang trống.</p>`;
            }
            
            return `<h2>${title}</h2>${content}`;
        },
        
        // Đã điều chỉnh lại: Lời giới thiệu nằm DƯỚI Team Grid và có icon
        renderAboutPage() {
            const membersHTML = Object.entries(MOCK_DATA.members).map(([key, member]) => `
                <div class="member-card" data-member="${key}">
                    <img src="${member.img}" alt="${member.name}">
                    <h3>${member.name}</h3>
                    <p>${member.role}</p>
                    <button class="btn-primary btn-detail-member">Xem Thêm</button>
                </div>
            `).join('');

            return `
                <h2 style="margin-top: 0;">🤝 Đội Ngũ Sáng Lập (${Object.keys(MOCK_DATA.members).length} Thành Viên)</h2>
                <div class="team-grid">${membersHTML}</div>
                
                <h2 style="margin-top: 40px; border-top: 2px solid #eee; padding-top: 20px;">Lời Giới Thiệu Từ Đội Ngũ</h2>
                <div class="team-intro-box">
                    <p><i class="fas fa-handshake team-intro-icon"></i> ${MOCK_DATA.teamIntro}</p>
                </div>
            `;
        },
        
        renderCartPage() {
            if (appState.cart.length === 0) {
                return `<h2>🛒 Giỏ Hàng</h2><p style="text-align:center; padding: 50px;">Giỏ hàng trống! Quay lại <a href="#shop">Cửa Hàng</a> để mua sắm.</p>`;
            }

            const selectedCount = appState.cart.filter(item => item.selected).length;
            const totalAmount = APP.Utils.calculateSelectedTotal();
            const totalItemsInCart = appState.cart.reduce((sum, item) => sum + item.quantity, 0);

            const cartRows = appState.cart.map(item => {
                const book = APP.Utils.findBook(item.id);
                const subtotal = item.price * item.quantity;
                
                return `
                    <tr data-id="${item.id}">
                        <td><input type="checkbox" class="select-item-checkbox" ${item.selected ? 'checked' : ''}></td>
                        <td>
                            <div class="cart-item-info">
                                <img src="${book.img}" alt="${book.title}">
                                <span><a href="#book/${book.id}">${book.title}</a></span>
                            </div>
                        </td>
                        <td>${APP.Utils.formatCurrency(item.price)}</td>
                        <td>
                            <div class="quantity-control">
                                <button class="btn-qty-minus">-</button>
                                <input type="text" value="${item.quantity}" readonly>
                                <button class="btn-qty-plus">+</button>
                            </div>
                        </td>
                        <td>${APP.Utils.formatCurrency(subtotal)}</td>
                        <td>
                            <button class="cart-remove-btn"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            }).join('');

            return `
                <h2>🛒 Giỏ Hàng (${totalItemsInCart} sản phẩm)</h2>
                <div class="checkout-layout">
                    <div class="checkout-box" style="padding: 10px;">
                        <table class="cart-table">
                            <thead>
                                <tr>
                                    <th style="width: 5%;">Chọn</th>
                                    <th style="width: 45%;">Sản phẩm</th>
                                    <th style="width: 15%;">Đơn giá</th>
                                    <th style="width: 15%;">Số lượng</th>
                                    <th style="width: 15%;">Thành tiền</th>
                                    <th style="width: 5%;">Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${cartRows}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="cart-summary-box">
                        <h3>Tóm Tắt Thanh Toán</h3>
                        <div class="total-area">
                            <p style="margin: 0; font-size: 1.1em;">Tổng tiền hàng (${selectedCount} sản phẩm được chọn):</p>
                            <div class="cart-summary-total">
                                <span>Thanh toán:</span>
                                <span>${APP.Utils.formatCurrency(totalAmount)}</span>
                            </div>
                        </div>
                        
                        <a href="${selectedCount > 0 ? '#checkout' : '#'}" class="btn-primary" id="btn-to-checkout" style="display:block; text-align:center; width: 100%; background-color: ${selectedCount > 0 ? '#ff4500' : '#ccc'}; margin-top: 20px; cursor: ${selectedCount > 0 ? 'pointer' : 'not-allowed'};">TIẾN HÀNH THANH TOÁN</a>
                    </div>
                </div>
            `;
        },
        
        renderCheckoutPage() {
            const selectedItems = appState.cart.filter(item => item.selected);
            
            if (selectedItems.length === 0) {
                 return `<h2>💳 Thanh Toán</h2><p style="text-align:center; padding: 50px;">Vui lòng chọn sản phẩm trong <a href="#cart">Giỏ hàng</a> để thanh toán.</p>`;
            }

            if (!appState.user) {
                 return `<h2>💳 Thanh Toán</h2><p style="text-align:center; padding: 50px;">Vui lòng <a href="#" onclick="APP.Auth.handleAuth('login'); return false;">Đăng nhập</a> để tiến hành thanh toán.</p>`;
            }

            const total = APP.Utils.calculateSelectedTotal();
            
            const summaryHTML = selectedItems.map(item => {
                const book = APP.Utils.findBook(item.id);
                const priceDisplay = APP.Utils.formatCurrency(item.price * item.quantity);
                return `<div class="cart-summary-item"><p title="${book.title}">${book.title.substring(0, 30)}... x ${item.quantity}</p><p>${priceDisplay}</p></div>`;
            }).join('');

            return `
                <h2>💳 Thanh Toán Đơn Hàng</h2>
                <div class="checkout-layout" style="grid-template-columns: 2fr 1fr;">
                    <div class="checkout-box">
                        <h3>Thông Tin Vận Chuyển</h3>
                        <form id="shipping-form">
                            <input type="text" id="name" placeholder="Họ Tên Người Nhận" required value="${appState.user ? appState.user.name : ''}">
                            <input type="tel" id="phone" placeholder="Số Điện Thoại" required>
                            <input type="email" id="email" placeholder="Email" value="${appState.user ? appState.user.email : ''}" readonly style="background-color: #f0f0f0;">
                            <textarea id="address" placeholder="Địa Chỉ Cụ Thể" required></textarea>
                            
                            <h4>Phương Thức Thanh Toán</h4>
                            <select id="payment-method" required>
                                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                                <option value="transfer">Chuyển khoản Ngân hàng</option>
                                <option value="card" disabled>Thẻ tín dụng (Chưa hỗ trợ)</option>
                            </select>
                            <button type="submit" class="btn-primary" style="width: 100%; background-color: #ff4500; margin-top: 20px;">XÁC NHẬN ĐẶT HÀNG</button>
                        </form>
                    </div>
                    <div class="checkout-box">
                        <h3>Tóm Tắt Đơn Hàng (${selectedItems.length} sản phẩm)</h3>
                        <div id="checkout-summary-list">${summaryHTML}</div>
                        
                        <div class="cart-summary-item" style="border-bottom: none;">
                            <p style="font-weight: bold;">Phí Vận Chuyển:</p>
                            <p style="font-weight: bold;">FREE</p>
                        </div>
                        <div class="total-final">
                            <span>Tổng Thanh Toán:</span>
                            <span>${APP.Utils.formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
            `;
        },
        
        // CẬP NHẬT: Trang Theo dõi Đơn hàng
        renderTrackingPage() {
            if (!appState.lastOrder) {
                return `<h2>📦 Theo Dõi Đơn Hàng</h2><p style="text-align:center; padding: 50px;">Chưa có đơn hàng nào được đặt thành công. Vui lòng kiểm tra lịch sử mua hàng sau khi đặt.</p>
                <div style="text-align: center;"><a href="#shop" class="btn-primary">Tiếp tục mua sắm</a></div>`;
            }
            const order = appState.lastOrder;
            const paymentMethodText = order.payment === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản Ngân hàng';
            
            return `
                <h2>📦 Chi Tiết Đơn Hàng Gần Nhất</h2>
                <div class="checkout-box" style="max-width: 700px; margin: 30px auto;">
                    <h3>Mã Đơn Hàng: <span style="color:#ff4500;">#${order.id}</span></h3>
                    
                    <div class="cart-summary-item"><p><strong>Trạng Thái:</strong></p><p style="color: green; font-weight: bold;">Đã Xác Nhận & Đang Chuẩn Bị</p></div>
                    <div class="cart-summary-item"><p>Ngày Đặt Hàng:</p><p>${order.date}</p></div>
                    <div class="cart-summary-item"><p>Phương Thức TT:</p><p>${paymentMethodText}</p></div>
                    
                    <h4 style="margin-top: 20px;">Thông Tin Người Nhận:</h4>
                    <p style="margin: 5px 0;"><strong>Họ Tên:</strong> ${order.name}</p>
                    <p style="margin: 5px 0;"><strong>Điện Thoại:</strong> ${order.phone}</p>
                    <p style="margin: 5px 0;"><strong>Địa Chỉ:</strong> ${order.address}</p>

                    <h4 style="margin-top: 20px;">Sản Phẩm (${order.items.length} loại):</h4>
                    <table class="cart-table" style="width: 100%;">
                        <thead><tr><th>Sản phẩm</th><th>Đơn giá</th><th>SL</th><th>Thành tiền</th></tr></thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.title}</td>
                                    <td>${APP.Utils.formatCurrency(item.finalPrice)}</td>
                                    <td>${item.quantity}</td>
                                    <td>${APP.Utils.formatCurrency(item.finalPrice * item.quantity)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="total-final">
                        <span>TỔNG THANH TOÁN:</span>
                        <span>${APP.Utils.formatCurrency(order.total)}</span>
                    </div>

                    <a href="#shop" class="btn-primary" style="margin-top: 20px; display: inline-block;">Tiếp tục mua sắm</a>
                </div>
            `;
        },
        renderFavoritesPage() {
            if (appState.favorites.length === 0) {
                 return `<h2>❤️ Sách Yêu Thích</h2><p style="text-align:center; padding: 50px;">Bạn chưa có sách nào trong mục yêu thích.</p>`;
            }
            const favoriteBooks = MOCK_DATA.books.filter(b => appState.favorites.includes(b.id));
            const booksHTML = favoriteBooks.map(book => APP.Renderer.renderBookCard(book)).join('');
            return `
                <h2>❤️ Sách Yêu Thích (${appState.favorites.length})</h2>
                <div class="product-grid">${booksHTML}</div>
            `;
        },
        
        renderBookCard(book) {
            const isFavorite = appState.favorites.includes(book.id);
            const priceDisplay = book.sale_price 
                ? `<span class="original-price" style="font-size:0.8em;">${APP.Utils.formatCurrency(book.price)}</span> <span class="price" style="color:#ff4500;">${APP.Utils.formatCurrency(book.sale_price)}</span>`
                : `<span class="price">${APP.Utils.formatCurrency(book.price)}</span>`;

            return `
                <div class="book-card" data-id="${book.id}">
                    <img src="${book.img}" alt="${book.title}">
                    <h4>${book.title}</h4>
                    <p style="min-height: 40px;">${book.discount ? `<span class="discount-tag">${book.discount}% OFF</span>` : ''}</p>
                    <div class="card-actions">
                        ${priceDisplay}
                        <a href="#book/${book.id}" class="btn-primary btn-detail-book" style="padding: 6px 10px; font-size: 0.8em;">Xem</a>
                        <i class="fas fa-heart heart-btn ${isFavorite ? 'liked' : ''}"></i>
                    </div>
                    <button class="btn-primary btn-add-cart" style="width:100%; margin-top: 10px;">Thêm vào Giỏ</button>
                </div>
            `;
        },

        // --- EVENT ATTACHMENT ---
        attachPageEventListeners() {
            // Logic cho Carousel 
            if (appState.currentPage === 'home') {
                APP.Carousel.init();
            }
            
            // Logic Thêm/Bỏ Yêu Thích
            document.querySelectorAll('.heart-btn').forEach(btn => {
                btn.onclick = (e) => {
                    const id = e.target.closest('.book-card, .carousel-item, .book-detail-layout').getAttribute('data-id');
                    const index = appState.favorites.indexOf(id);
                    if (index > -1) {
                        appState.favorites.splice(index, 1);
                        alert('💔 Đã gỡ khỏi Sách Yêu Thích.');
                    } else {
                        appState.favorites.push(id);
                        alert('❤️ Đã thêm vào Sách Yêu Thích!');
                    }
                    APP.Renderer.renderApp(); 
                    APP.Core.saveAppState();
                };
            });

            // Logic Thêm vào Giỏ hàng (Nút trên Card/Carousel)
            document.querySelectorAll('.btn-add-cart').forEach(btn => {
                btn.onclick = (e) => {
                    const id = e.target.closest('.book-card, .carousel-item').getAttribute('data-id');
                    const book = APP.Utils.findBook(id);
                    APP.Cart.addToCart(id);
                    alert(`✅ Đã thêm 1 x ${book.title} vào Giỏ hàng!`);
                };
            });
            
            // Logic Trang Chi Tiết (Nút Thêm vào Giỏ & Tăng/Giảm SL)
            if (appState.currentPage === 'bookDetail') {
                 const bookId = appState.currentPageParams.id;
                 const book = APP.Utils.findBook(bookId);
                 const qtyInput = document.getElementById('detail-quantity');
                 
                 document.querySelector('.btn-qty-plus.detail-qty').onclick = () => {
                     qtyInput.value = parseInt(qtyInput.value) + 1;
                 };
                 document.querySelector('.btn-qty-minus.detail-qty').onclick = () => {
                     let current = parseInt(qtyInput.value);
                     if (current > 1) qtyInput.value = current - 1;
                 };
                 
                 document.querySelector('.book-detail-info .btn-add-cart').onclick = () => {
                     const quantity = parseInt(qtyInput.value) || 1;
                     APP.Cart.addToCart(bookId, quantity);
                     alert(`✅ Đã thêm ${quantity} x ${book.title} vào Giỏ hàng!`);
                 };
            }
            
            // Logic Giỏ hàng (Tăng/Giảm, Xóa, Tích Chọn)
            if (appState.currentPage === 'cart') {
                 document.querySelectorAll('.select-item-checkbox').forEach(checkbox => {
                    checkbox.onchange = (e) => {
                        const id = e.target.closest('tr').getAttribute('data-id');
                        APP.Cart.toggleSelection(id);
                    };
                });
                
                document.querySelectorAll('.btn-qty-plus').forEach(btn => {
                    btn.onclick = (e) => {
                        const id = e.target.closest('tr').getAttribute('data-id');
                        APP.Cart.updateQuantity(id, 1);
                    };
                });
                
                document.querySelectorAll('.btn-qty-minus').forEach(btn => {
                    btn.onclick = (e) => {
                        const id = e.target.closest('tr').getAttribute('data-id');
                        APP.Cart.updateQuantity(id, -1);
                    };
                });
                 
                 document.querySelectorAll('.cart-remove-btn').forEach(btn => {
                    btn.onclick = (e) => {
                        const id = e.target.closest('tr').getAttribute('data-id');
                        if(confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
                             APP.Cart.removeFromCart(id);
                        }
                    };
                });
                 
                 document.getElementById('btn-to-checkout').onclick = (e) => {
                    if (APP.Utils.calculateSelectedTotal() === 0) {
                        e.preventDefault();
                        alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
                    } else if (!appState.user) {
                        e.preventDefault();
                        APP.Utils.closeModal();
                        APP.Auth.handleAuth('login');
                    }
                 };
            }
            
            // CẬP NHẬT: Logic Chi tiết Thành viên (Thêm profileLink)
            if (appState.currentPage === 'about') {
                document.querySelectorAll('.btn-detail-member').forEach(btn => {
                     btn.onclick = (e) => {
                        const memberKey = e.target.closest('.member-card').getAttribute('data-member');
                        const member = MOCK_DATA.members[memberKey];
                        const content = `
                            <div style="text-align:center;">
                                <img src="${member.img}" style="width: 120px; height: 120px; border-radius:50%; margin-bottom: 15px; border: 3px solid #1e90ff;">
                                <h3 style="color:#2c3e50; margin-bottom: 5px;">${member.name}</h3>
                                <p style="color: #1e90ff; font-weight: bold; margin-top: 0;">${member.role}</p>
                            </div>
                            <p><strong>Ngày sinh:</strong> ${member.dob}</p>
                            <p><strong>Quê quán:</strong> ${member.hometown}</p>
                            <p><strong>Sở thích:</strong> ${member.hobby}</p>
                            <a href="${member.facebook}" target="_blank" class="btn-primary" style="display:block; margin-top: 20px; background-color: #3b5998;"><i class="fab fa-facebook-square"></i> Truy cập Facebook</a>
                            <a href="${member.profileLink}" target="_blank" class="btn-primary" style="display:block; margin-top: 10px; background-color: #0077b5;"><i class="fas fa-link"></i> Liên kết Hồ sơ</a>
                        `;
                        APP.Utils.openModal(content, `Thông Tin Về ${member.name}`);
                    };
                });
            }


            // Logic Xác nhận Đặt hàng (Checkout)
            if (appState.currentPage === 'checkout') {
                document.getElementById('shipping-form').onsubmit = (e) => {
                    e.preventDefault();
                    
                    const totalSelected = APP.Utils.calculateSelectedTotal();
                    if (totalSelected === 0) {
                        alert('Không có sản phẩm nào được chọn để thanh toán!');
                        return;
                    }
                    
                    const formData = {
                        name: document.getElementById('name').value,
                        phone: document.getElementById('phone').value,
                        address: document.getElementById('address').value,
                        payment: document.getElementById('payment-method').value
                    };
                    APP.Cart.placeOrder(formData);
                };
            }
        }
    }
};

// Khởi chạy ứng dụng khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', APP.init);