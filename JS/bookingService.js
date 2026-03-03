function BookingService() {
    var bookingService = new Object();
    var STORAGE_KEY = 'vuatho_bookings';

    bookingService.create = function (worker, customer) {
        var booking = new Object();
        booking.id = Date.now();
        booking.workerId   = worker.id;
        booking.workerName = worker.name;
        booking.workerSkill = worker.skill;
        booking.workerAvatar = worker.avatar;
        booking.pricePerHour = worker.pricePerHour;
        booking.customerName  = customer.name;
        booking.customerPhone = customer.phone;
        booking.customerAddress = customer.address;
        booking.serviceDate   = customer.serviceDate;
        booking.serviceTime   = customer.serviceTime;
        booking.hours         = customer.hours || 2;
        booking.note          = customer.note || '';
        booking.totalPrice    = worker.pricePerHour * booking.hours;
        booking.status        = 'pending';
        booking.createdAt     = new Date().toISOString();
        return booking;
    };

    bookingService.getAll = function () {
        var json = localStorage.getItem(STORAGE_KEY);
        if (!json) return [];
        var list = JSON.parse(json);
        return list || [];
    };

    bookingService.save = function (booking) {
        var list = this.getAll();
        list.push(booking);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return list;
    };

    bookingService.remove = function (bookingId) {
        var list = this.getAll();
        var filtered = [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].id != bookingId) filtered.push(list[i]);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return filtered;
    };

    bookingService.count = function () {
        return this.getAll().length;
    };

    bookingService.formatPrice = function (price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
    };

    bookingService.toHtmlItem = function (booking) {
        var statusLabel = booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận';
        var statusClass = booking.status === 'confirmed' ? 'status-confirmed' : 'status-pending';
        var html = '';
        html += '<div class="booking-item">';
        html += '  <div class="booking-item-icon">🛠</div>';
        html += '  <div class="booking-item-info">';
        html += '    <div class="booking-item-service">' + booking.workerSkill + ' – ' + booking.workerName + '</div>';
        html += '    <div class="booking-item-details">📅 ' + booking.serviceDate + ' | ⏰ ' + booking.serviceTime + ' | ⏱ ' + booking.hours + ' giờ</div>';
        html += '    <div class="booking-item-details">📍 ' + booking.customerAddress + '</div>';
        html += '  </div>';
        html += '  <span class="booking-item-price">' + bookingService.formatPrice(booking.totalPrice) + '</span>';
        html += '  <span class="booking-item-status ' + statusClass + '">' + statusLabel + '</span>';
        html += '  <button onclick="cancelBooking(' + booking.id + ')" style="margin-left:10px;background:none;border:none;cursor:pointer;color:#e53935;font-size:18px;" title="Hủy">✕</button>';
        html += '</div>';
        return html;
    };

    bookingService.toHtmlItems = function (bookings) {
        if (!bookings || bookings.length === 0) {
            return '<div class="empty-state">'
                 + '  <div class="empty-state-icon">📋</div>'
                 + '  <div class="empty-state-text">Bạn chưa có đơn đặt nào</div>'
                 + '  <a href="home.html" class="btn btn-primary">Tìm thợ ngay</a>'
                 + '</div>';
        }
        var html = '<div class="bookings-list">';
        for (var i = 0; i < bookings.length; i++) {
            html += bookingService.toHtmlItem(bookings[i]);
        }
        html += '</div>';
        return html;
    };

    return bookingService;
}
