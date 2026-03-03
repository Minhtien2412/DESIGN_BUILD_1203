function WorkerService() {
    var workerService = new Object();

    var SERVICE_CATEGORIES = [
        { id: 1, icon: '⚡', name: 'Sửa điện',      slug: 'sua-dien',       count: 48 },
        { id: 2, icon: '🔧', name: 'Sửa ống nước',  slug: 'sua-ong-nuoc',   count: 36 },
        { id: 3, icon: '🧹', name: 'Dọn dẹp nhà',   slug: 'don-dep-nha',    count: 55 },
        { id: 4, icon: '🎨', name: 'Sơn nhà',       slug: 'son-nha',        count: 29 },
        { id: 5, icon: '🪚', name: 'Thợ mộc',       slug: 'tho-moc',        count: 22 },
        { id: 6, icon: '❄️', name: 'Sửa điều hòa',  slug: 'sua-dieu-hoa',   count: 41 },
        { id: 7, icon: '🏗️', name: 'Xây dựng',      slug: 'xay-dung',       count: 18 },
        { id: 8, icon: '🔑', name: 'Thợ khóa',      slug: 'tho-khoa',       count: 25 },
        { id: 9, icon: '🛁', name: 'Nội thất',       slug: 'noi-that',       count: 33 },
        { id: 10, icon: '🌿', name: 'Cây xanh',      slug: 'cay-xanh',       count: 14 },
        { id: 11, icon: '📱', name: 'Sửa điện tử',   slug: 'sua-dien-tu',    count: 37 },
        { id: 12, icon: '🚗', name: 'Sửa xe',        slug: 'sua-xe',         count: 31 }
    ];

    var WORKERS = [
        {
            id: 1,
            name: 'Nguyễn Văn Anh',
            avatar: 'https://i.pravatar.cc/100?img=11',
            skill: 'Thợ điện',
            categoryId: 1,
            categorySlug: 'sua-dien',
            rating: 4.9,
            reviewCount: 128,
            jobsDone: 214,
            yearsExp: 7,
            pricePerHour: 150000,
            tags: ['Điện dân dụng', 'Điện công nghiệp', 'Lắp đặt'],
            location: 'Quận 1, TP.HCM',
            verified: true
        },
        {
            id: 2,
            name: 'Trần Minh Đức',
            avatar: 'https://i.pravatar.cc/100?img=12',
            skill: 'Thợ điện',
            categoryId: 1,
            categorySlug: 'sua-dien',
            rating: 4.7,
            reviewCount: 96,
            jobsDone: 173,
            yearsExp: 5,
            pricePerHour: 120000,
            tags: ['Điện dân dụng', 'Sửa chữa', 'Đường dây'],
            location: 'Quận 3, TP.HCM',
            verified: true
        },
        {
            id: 3,
            name: 'Lê Thị Hương',
            avatar: 'https://i.pravatar.cc/100?img=5',
            skill: 'Dọn dẹp',
            categoryId: 3,
            categorySlug: 'don-dep-nha',
            rating: 5.0,
            reviewCount: 203,
            jobsDone: 340,
            yearsExp: 8,
            pricePerHour: 80000,
            tags: ['Dọn nhà', 'Văn phòng', 'Sau xây dựng'],
            location: 'Quận 7, TP.HCM',
            verified: true
        },
        {
            id: 4,
            name: 'Phạm Văn Bình',
            avatar: 'https://i.pravatar.cc/100?img=14',
            skill: 'Thợ nước',
            categoryId: 2,
            categorySlug: 'sua-ong-nuoc',
            rating: 4.8,
            reviewCount: 115,
            jobsDone: 190,
            yearsExp: 6,
            pricePerHour: 130000,
            tags: ['Ống nước', 'Thoát nước', 'Lắp đặt vòi'],
            location: 'Quận 5, TP.HCM',
            verified: true
        },
        {
            id: 5,
            name: 'Hoàng Quang Trung',
            avatar: 'https://i.pravatar.cc/100?img=15',
            skill: 'Thợ sơn',
            categoryId: 4,
            categorySlug: 'son-nha',
            rating: 4.6,
            reviewCount: 78,
            jobsDone: 125,
            yearsExp: 4,
            pricePerHour: 160000,
            tags: ['Sơn tường', 'Sơn trần', 'Sơn ngoại thất'],
            location: 'Quận Bình Thạnh, TP.HCM',
            verified: false
        },
        {
            id: 6,
            name: 'Võ Thị Thu',
            avatar: 'https://i.pravatar.cc/100?img=9',
            skill: 'Dọn dẹp',
            categoryId: 3,
            categorySlug: 'don-dep-nha',
            rating: 4.9,
            reviewCount: 167,
            jobsDone: 280,
            yearsExp: 9,
            pricePerHour: 85000,
            tags: ['Dọn nhà', 'Tổng vệ sinh', 'Giặt thảm'],
            location: 'Quận Tân Phú, TP.HCM',
            verified: true
        },
        {
            id: 7,
            name: 'Đặng Minh Khoa',
            avatar: 'https://i.pravatar.cc/100?img=17',
            skill: 'Thợ điều hòa',
            categoryId: 6,
            categorySlug: 'sua-dieu-hoa',
            rating: 4.8,
            reviewCount: 92,
            jobsDone: 156,
            yearsExp: 6,
            pricePerHour: 200000,
            tags: ['Sửa điều hòa', 'Vệ sinh', 'Nạp gas'],
            location: 'Quận Gò Vấp, TP.HCM',
            verified: true
        },
        {
            id: 8,
            name: 'Nguyễn Hữu Nam',
            avatar: 'https://i.pravatar.cc/100?img=18',
            skill: 'Thợ mộc',
            categoryId: 5,
            categorySlug: 'tho-moc',
            rating: 4.7,
            reviewCount: 64,
            jobsDone: 98,
            yearsExp: 10,
            pricePerHour: 180000,
            tags: ['Đồ gỗ', 'Tủ bếp', 'Sửa chữa đồ gỗ'],
            location: 'Quận 12, TP.HCM',
            verified: true
        }
    ];

    workerService.getCategories = function () {
        return SERVICE_CATEGORIES;
    };

    workerService.getCategoryBySlug = function (slug) {
        for (var i = 0; i < SERVICE_CATEGORIES.length; i++) {
            if (SERVICE_CATEGORIES[i].slug === slug) return SERVICE_CATEGORIES[i];
        }
        return null;
    };

    workerService.getAll = function () {
        return WORKERS;
    };

    workerService.getById = function (id) {
        for (var i = 0; i < WORKERS.length; i++) {
            if (WORKERS[i].id == id) return WORKERS[i];
        }
        return null;
    };

    workerService.getByCategory = function (slug) {
        if (!slug) return WORKERS;
        var result = [];
        for (var i = 0; i < WORKERS.length; i++) {
            if (WORKERS[i].categorySlug === slug) result.push(WORKERS[i]);
        }
        return result;
    };

    workerService.formatPrice = function (price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
    };

    workerService.renderStars = function (rating) {
        var full  = Math.floor(rating);
        var half  = rating - full >= 0.5 ? 1 : 0;
        var empty = 5 - full - half;
        var html  = '';
        for (var i = 0; i < full;  i++) html += '★';
        for (var i = 0; i < half;  i++) html += '½';
        for (var i = 0; i < empty; i++) html += '☆';
        return html;
    };

    workerService.toCategoryHtmlItem = function (cat) {
        var html = '';
        html += '<a href="workers.html?category=' + cat.slug + '" class="category-card">';
        html += '  <div class="category-icon">' + cat.icon + '</div>';
        html += '  <div class="category-name">' + cat.name + '</div>';
        html += '  <div class="category-count">' + cat.count + ' thợ</div>';
        html += '</a>';
        return html;
    };

    workerService.toCategoryHtmlItems = function (categories) {
        var html = '<div class="service-categories">';
        for (var i = 0; i < categories.length; i++) {
            html += workerService.toCategoryHtmlItem(categories[i]);
        }
        html += '</div>';
        return html;
    };

    workerService.toWorkerCardHtml = function (worker) {
        var tagsHtml = '';
        for (var i = 0; i < worker.tags.length; i++) {
            tagsHtml += '<span class="worker-tag">' + worker.tags[i] + '</span>';
        }

        var verifiedBadge = worker.verified
            ? ' <span style="color:#27ae60;font-size:13px;" title="Đã xác minh">✔</span>'
            : '';

        var html = '';
        html += '<div class="worker-card">';
        html += '  <div class="worker-header">';
        html += '    <img class="worker-avatar" src="' + worker.avatar + '" alt="' + worker.name + '">';
        html += '    <div>';
        html += '      <div class="worker-info-name">' + worker.name + verifiedBadge + '</div>';
        html += '      <div class="worker-info-skill">' + worker.skill + '</div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div class="worker-rating">';
        html += '    <span style="color:#f5a623">' + workerService.renderStars(worker.rating) + '</span>';
        html += '    <span class="worker-rating-score">' + worker.rating + '</span>';
        html += '    <span style="color:#aaa;font-size:12px;">(' + worker.reviewCount + ' đánh giá)</span>';
        html += '  </div>';
        html += '  <div class="worker-stats">';
        html += '    <span class="worker-stat">🛠 ' + worker.jobsDone + ' việc</span>';
        html += '    <span class="worker-stat">📅 ' + worker.yearsExp + ' năm KN</span>';
        html += '    <span class="worker-stat">📍 ' + worker.location + '</span>';
        html += '  </div>';
        html += '  <div class="worker-tags">' + tagsHtml + '</div>';
        html += '  <div class="worker-price">' + workerService.formatPrice(worker.pricePerHour) + ' <span>/ giờ</span></div>';
        html += '  <div class="worker-actions">';
        html += '    <a href="booking.html?worker=' + worker.id + '" class="btn btn-primary">Đặt ngay</a>';
        html += '    <button onclick="bookWorker(' + worker.id + ')" class="btn btn-outline">Xem hồ sơ</button>';
        html += '  </div>';
        html += '</div>';
        return html;
    };

    workerService.toWorkerCardsHtml = function (workers) {
        if (!workers || workers.length === 0) {
            return '<div class="empty-state">'
                 + '  <div class="empty-state-icon">🔍</div>'
                 + '  <div class="empty-state-text">Không tìm thấy thợ phù hợp</div>'
                 + '  <a href="home.html" class="btn btn-primary">Xem tất cả dịch vụ</a>'
                 + '</div>';
        }
        var html = '<div class="worker-items">';
        for (var i = 0; i < workers.length; i++) {
            html += workerService.toWorkerCardHtml(workers[i]);
        }
        html += '</div>';
        return html;
    };

    return workerService;
}
