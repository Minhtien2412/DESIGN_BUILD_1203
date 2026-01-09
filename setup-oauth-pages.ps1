<#
.SYNOPSIS
    Setup Privacy Policy and Terms of Service pages for Google OAuth
    
.DESCRIPTION
    Creates privacy-policy.html and terms-of-service.html on baotienweb.cloud server
    Required for Google OAuth consent screen verification
    
.NOTES
    Server: root@103.200.20.100
    Password: Enter when prompted
#>

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Google OAuth Pages Setup" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "📋 Will create:" -ForegroundColor Yellow
Write-Host "  1. https://baotienweb.cloud/privacy-policy.html" -ForegroundColor White
Write-Host "  2. https://baotienweb.cloud/terms-of-service.html`n" -ForegroundColor White

# Privacy Policy HTML content
$privacyPolicy = @'
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chính sách Bảo mật - NhàXinh Design</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-top: 40px;
            margin-bottom: 40px;
        }
        h1 {
            color: #0066CC;
            margin-bottom: 10px;
            font-size: 32px;
        }
        .date {
            color: #666;
            font-size: 14px;
            margin-bottom: 30px;
        }
        h2 {
            color: #0066CC;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 24px;
        }
        h3 {
            color: #333;
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 18px;
        }
        p {
            margin-bottom: 15px;
            text-align: justify;
        }
        ul {
            margin-left: 30px;
            margin-bottom: 15px;
        }
        li {
            margin-bottom: 8px;
        }
        .contact-info {
            background: #f0f7ff;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Chính sách Bảo mật</h1>
        <p class="date">Có hiệu lực từ ngày: 7 tháng 1 năm 2026</p>

        <p>Chào mừng bạn đến với NhàXinh Design ("chúng tôi", "của chúng tôi"). Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. Chính sách Bảo mật này giải thích cách chúng tôi thu thập, sử dụng, chia sẻ và bảo vệ thông tin của bạn khi bạn sử dụng ứng dụng và dịch vụ của chúng tôi.</p>

        <h2>1. Thông tin Chúng tôi Thu thập</h2>
        
        <h3>1.1. Thông tin Bạn Cung cấp</h3>
        <ul>
            <li><strong>Thông tin Tài khoản:</strong> Email, tên, số điện thoại khi bạn đăng ký tài khoản</li>
            <li><strong>Thông tin Google:</strong> Khi bạn đăng nhập bằng Google, chúng tôi nhận được email, tên, và ảnh đại diện từ tài khoản Google của bạn</li>
            <li><strong>Thông tin Dự án:</strong> Thông tin về dự án xây dựng, thiết kế nội thất mà bạn tạo hoặc quản lý</li>
            <li><strong>Thông tin Liên hệ:</strong> Tin nhắn, phản hồi, yêu cầu hỗ trợ bạn gửi cho chúng tôi</li>
        </ul>

        <h3>1.2. Thông tin Thu thập Tự động</h3>
        <ul>
            <li><strong>Thông tin Thiết bị:</strong> Loại thiết bị, hệ điều hành, phiên bản ứng dụng</li>
            <li><strong>Dữ liệu Sử dụng:</strong> Tính năng bạn sử dụng, thời gian truy cập, lỗi ứng dụng</li>
            <li><strong>Vị trí:</strong> Vị trí địa lý gần đúng (nếu bạn cho phép) để tìm dịch vụ gần bạn</li>
        </ul>

        <h2>2. Cách Chúng tôi Sử dụng Thông tin</h2>
        
        <p>Chúng tôi sử dụng thông tin của bạn để:</p>
        <ul>
            <li><strong>Cung cấp Dịch vụ:</strong> Tạo và quản lý tài khoản, xử lý dự án, cung cấp hỗ trợ khách hàng</li>
            <li><strong>Cải thiện Dịch vụ:</strong> Phân tích cách sử dụng để cải thiện tính năng và trải nghiệm người dùng</li>
            <li><strong>Xác thực:</strong> Xác minh danh tính của bạn khi đăng nhập</li>
            <li><strong>Liên lạc:</strong> Gửi thông báo về dự án, cập nhật dịch vụ, thông tin quan trọng</li>
            <li><strong>Bảo mật:</strong> Phát hiện và ngăn chặn gian lận, lạm dụng, vi phạm điều khoản</li>
            <li><strong>Tuân thủ Pháp luật:</strong> Đáp ứng các yêu cầu pháp lý và bảo vệ quyền lợi của chúng tôi</li>
        </ul>

        <h2>3. Chia sẻ Thông tin</h2>
        
        <p>Chúng tôi không bán thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp sau:</p>
        
        <h3>3.1. Với Đối tác Dịch vụ</h3>
        <ul>
            <li><strong>Google Cloud Platform:</strong> Lưu trữ dữ liệu và xác thực</li>
            <li><strong>Perfex CRM:</strong> Quản lý quan hệ khách hàng và dự án</li>
            <li><strong>Nhà cung cấp thanh toán:</strong> Xử lý giao dịch thanh toán (nếu có)</li>
        </ul>

        <h3>3.2. Theo Yêu cầu Pháp lý</h3>
        <p>Chúng tôi có thể tiết lộ thông tin khi:</p>
        <ul>
            <li>Được yêu cầu bởi luật pháp, tòa án, hoặc cơ quan chính phủ</li>
            <li>Cần thiết để bảo vệ quyền lợi, tài sản, hoặc an toàn của chúng tôi và người dùng</li>
            <li>Phát hiện hoặc ngăn chặn gian lận, vi phạm bảo mật</li>
        </ul>

        <h3>3.3. Với Sự Đồng ý của Bạn</h3>
        <p>Chúng tôi sẽ chia sẻ thông tin cho các mục đích khác nếu bạn đồng ý rõ ràng.</p>

        <h2>4. Bảo mật Thông tin</h2>
        
        <p>Chúng tôi thực hiện các biện pháp bảo mật kỹ thuật và tổ chức để bảo vệ thông tin của bạn:</p>
        <ul>
            <li><strong>Mã hóa:</strong> Dữ liệu được mã hóa khi truyền tải (HTTPS/TLS) và khi lưu trữ</li>
            <li><strong>Kiểm soát Truy cập:</strong> Chỉ nhân viên được ủy quyền mới có quyền truy cập thông tin cá nhân</li>
            <li><strong>Xác thực Đa yếu tố:</strong> Bảo vệ tài khoản quản trị và hệ thống quan trọng</li>
            <li><strong>Giám sát:</strong> Theo dõi và ghi nhật ký hoạt động để phát hiện truy cập bất thường</li>
            <li><strong>Cập nhật Bảo mật:</strong> Thường xuyên cập nhật phần mềm và vá lỗi bảo mật</li>
        </ul>

        <h2>5. Quyền của Bạn</h2>
        
        <p>Bạn có các quyền sau đối với thông tin cá nhân của mình:</p>
        
        <h3>5.1. Truy cập và Cập nhật</h3>
        <p>Bạn có thể xem và chỉnh sửa thông tin tài khoản trong phần "Hồ sơ" của ứng dụng.</p>

        <h3>5.2. Xóa Dữ liệu</h3>
        <p>Bạn có quyền yêu cầu xóa tài khoản và dữ liệu cá nhân. Liên hệ với chúng tôi qua email support@baotienweb.cloud.</p>

        <h3>5.3. Xuất Dữ liệu</h3>
        <p>Bạn có thể yêu cầu nhận bản sao dữ liệu cá nhân của mình ở định dạng có thể đọc được.</p>

        <h3>5.4. Từ chối Xử lý</h3>
        <p>Bạn có thể từ chối nhận email marketing hoặc giới hạn việc thu thập một số thông tin nhất định.</p>

        <h3>5.5. Thu hồi Đồng ý</h3>
        <p>Bạn có thể thu hồi sự đồng ý đã cấp bất kỳ lúc nào, nhưng điều này không ảnh hưởng đến tính hợp pháp của việc xử lý trước đó.</p>

        <h2>6. Lưu trữ Dữ liệu</h2>
        
        <p>Chúng tôi lưu trữ thông tin của bạn:</p>
        <ul>
            <li>Trong thời gian bạn sử dụng dịch vụ</li>
            <li>Thêm thời gian hợp lý để tuân thủ nghĩa vụ pháp lý, giải quyết tranh chấp, thực thi hợp đồng</li>
            <li>Dữ liệu sao lưu có thể được lưu trữ thêm một khoảng thời gian theo chính sách sao lưu</li>
        </ul>

        <h2>7. Trẻ em</h2>
        
        <p>Dịch vụ của chúng tôi không nhắm đến trẻ em dưới 13 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em dưới 13 tuổi. Nếu bạn phát hiện chúng tôi đã thu thập thông tin từ trẻ em, vui lòng liên hệ để chúng tôi xóa ngay.</p>

        <h2>8. Thay đổi Chính sách</h2>
        
        <p>Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian. Khi có thay đổi quan trọng, chúng tôi sẽ:</p>
        <ul>
            <li>Thông báo trong ứng dụng</li>
            <li>Gửi email thông báo (nếu thay đổi ảnh hưởng lớn đến quyền lợi của bạn)</li>
            <li>Cập nhật ngày "Có hiệu lực" ở đầu trang</li>
        </ul>
        <p>Việc bạn tiếp tục sử dụng dịch vụ sau khi thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận chính sách mới.</p>

        <h2>9. Chuyển giao Dữ liệu Quốc tế</h2>
        
        <p>Dữ liệu của bạn có thể được lưu trữ và xử lý tại Việt Nam hoặc các quốc gia khác nơi chúng tôi hoặc đối tác dịch vụ của chúng tôi hoạt động. Chúng tôi đảm bảo rằng dữ liệu được bảo vệ theo tiêu chuẩn tương đương bất kể vị trí lưu trữ.</p>

        <h2>10. Google OAuth</h2>
        
        <p>Khi bạn sử dụng "Đăng nhập với Google":</p>
        <ul>
            <li>Chúng tôi chỉ yêu cầu quyền truy cập email và thông tin hồ sơ cơ bản</li>
            <li>Chúng tôi không lưu trữ mật khẩu Google của bạn</li>
            <li>Bạn có thể thu hồi quyền truy cập bất kỳ lúc nào tại <a href="https://myaccount.google.com/permissions" target="_blank">Google Account Permissions</a></li>
            <li>Chúng tôi tuân thủ <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank">Google API Services User Data Policy</a></li>
        </ul>

        <div class="contact-info">
            <h2>10. Liên hệ</h2>
            <p>Nếu bạn có câu hỏi, thắc mắc hoặc yêu cầu về Chính sách Bảo mật này, vui lòng liên hệ:</p>
            <p><strong>NhàXinh Design</strong></p>
            <p>Email: <a href="mailto:support@baotienweb.cloud">support@baotienweb.cloud</a></p>
            <p>Website: <a href="https://baotienweb.cloud">https://baotienweb.cloud</a></p>
            <p>Địa chỉ: Việt Nam</p>
        </div>

        <div class="footer">
            <p>&copy; 2026 NhàXinh Design. All rights reserved.</p>
            <p>Tài liệu này có sẵn bằng tiếng Việt và tiếng Anh.</p>
        </div>
    </div>
</body>
</html>
'@

# Terms of Service HTML content
$termsOfService = @'
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Điều khoản Dịch vụ - NhàXinh Design</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-top: 40px;
            margin-bottom: 40px;
        }
        h1 {
            color: #0066CC;
            margin-bottom: 10px;
            font-size: 32px;
        }
        .date {
            color: #666;
            font-size: 14px;
            margin-bottom: 30px;
        }
        h2 {
            color: #0066CC;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 24px;
        }
        h3 {
            color: #333;
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 18px;
        }
        p {
            margin-bottom: 15px;
            text-align: justify;
        }
        ul {
            margin-left: 30px;
            margin-bottom: 15px;
        }
        li {
            margin-bottom: 8px;
        }
        .important {
            background: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
        }
        .contact-info {
            background: #f0f7ff;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Điều khoản Dịch vụ</h1>
        <p class="date">Có hiệu lực từ ngày: 7 tháng 1 năm 2026</p>

        <div class="important">
            <p><strong>Quan trọng:</strong> Vui lòng đọc kỹ các Điều khoản Dịch vụ này trước khi sử dụng ứng dụng và dịch vụ của chúng tôi. Bằng việc sử dụng dịch vụ, bạn đồng ý bị ràng buộc bởi các điều khoản này.</p>
        </div>

        <h2>1. Chấp nhận Điều khoản</h2>
        
        <p>Các Điều khoản Dịch vụ này ("Điều khoản") là một thỏa thuận pháp lý giữa bạn và NhàXinh Design ("chúng tôi", "của chúng tôi") quy định quyền và nghĩa vụ của bạn khi sử dụng ứng dụng di động, website và các dịch vụ liên quan (gọi chung là "Dịch vụ").</p>

        <p>Bằng cách:</p>
        <ul>
            <li>Tải xuống, cài đặt hoặc sử dụng ứng dụng</li>
            <li>Đăng ký tài khoản</li>
            <li>Truy cập hoặc sử dụng bất kỳ phần nào của Dịch vụ</li>
        </ul>
        <p>Bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản này và <a href="/privacy-policy.html">Chính sách Bảo mật</a> của chúng tôi.</p>

        <h2>2. Tính đủ Điều kiện</h2>
        
        <p>Để sử dụng Dịch vụ, bạn phải:</p>
        <ul>
            <li>Đủ 18 tuổi trở lên hoặc đã đạt tuổi trưởng thành theo pháp luật tại quốc gia của bạn</li>
            <li>Có năng lực pháp lý đầy đủ để ký kết hợp đồng</li>
            <li>Không bị cấm sử dụng Dịch vụ theo pháp luật hiện hành</li>
        </ul>

        <p>Nếu bạn sử dụng Dịch vụ thay mặt cho một tổ chức (ví dụ: công ty, doanh nghiệp), bạn xác nhận rằng bạn có thẩm quyền ràng buộc tổ chức đó với các Điều khoản này.</p>

        <h2>3. Tài khoản Người dùng</h2>
        
        <h3>3.1. Đăng ký Tài khoản</h3>
        <p>Để truy cập đầy đủ các tính năng của Dịch vụ, bạn cần tạo tài khoản bằng cách:</p>
        <ul>
            <li>Đăng ký bằng email và mật khẩu</li>
            <li>Đăng nhập bằng tài khoản Google</li>
        </ul>

        <h3>3.2. Bảo mật Tài khoản</h3>
        <p>Bạn chịu trách nhiệm:</p>
        <ul>
            <li>Duy trì tính bảo mật của thông tin đăng nhập</li>
            <li>Tất cả các hoạt động xảy ra dưới tài khoản của bạn</li>
            <li>Thông báo ngay cho chúng tôi nếu phát hiện việc sử dụng trái phép</li>
        </ul>

        <h3>3.3. Thông tin Chính xác</h3>
        <p>Bạn đồng ý cung cấp thông tin chính xác, đầy đủ và cập nhật khi đăng ký và sử dụng Dịch vụ.</p>

        <h2>4. Sử dụng Dịch vụ</h2>
        
        <h3>4.1. Giấy phép Sử dụng</h3>
        <p>Chúng tôi cấp cho bạn giấy phép hạn chế, không độc quyền, không thể chuyển nhượng, có thể thu hồi để sử dụng Dịch vụ cho mục đích cá nhân hoặc kinh doanh nội bộ hợp pháp của bạn, tuân thủ các Điều khoản này.</p>

        <h3>4.2. Hành vi Bị cấm</h3>
        <p>Bạn đồng ý KHÔNG:</p>
        <ul>
            <li>Vi phạm bất kỳ luật hoặc quy định hiện hành nào</li>
            <li>Xâm phạm quyền sở hữu trí tuệ hoặc quyền riêng tư của người khác</li>
            <li>Tải lên hoặc truyền tải virus, malware hoặc mã độc hại</li>
            <li>Can thiệp hoặc làm gián đoạn Dịch vụ hoặc máy chủ/mạng kết nối với Dịch vụ</li>
            <li>Sử dụng bot, script hoặc công cụ tự động để truy cập Dịch vụ</li>
            <li>Đảo ngược kỹ thuật, dịch ngược hoặc tách rời Dịch vụ</li>
            <li>Thu thập thông tin người dùng khác mà không có sự đồng ý</li>
            <li>Giả mạo danh tính hoặc gây hiểu nhầm về mối quan hệ với bất kỳ tổ chức nào</li>
            <li>Sử dụng Dịch vụ cho mục đích bất hợp pháp, lừa đảo hoặc gây hại</li>
        </ul>

        <h2>5. Nội dung Người dùng</h2>
        
        <h3>5.1. Quyền sở hữu của Bạn</h3>
        <p>Bạn giữ quyền sở hữu đối với nội dung bạn tạo ra hoặc tải lên Dịch vụ ("Nội dung Người dùng"), bao gồm thông tin dự án, hình ảnh, tài liệu.</p>

        <h3>5.2. Giấy phép Cấp cho Chúng tôi</h3>
        <p>Bằng cách tải lên Nội dung Người dùng, bạn cấp cho chúng tôi giấy phép toàn cầu, không độc quyền, miễn phí bản quyền để:</p>
        <ul>
            <li>Lưu trữ, xử lý và hiển thị Nội dung Người dùng</li>
            <li>Cung cấp Dịch vụ cho bạn</li>
            <li>Cải thiện và phát triển Dịch vụ</li>
        </ul>
        <p>Giấy phép này kết thúc khi bạn xóa Nội dung Người dùng hoặc đóng tài khoản, trừ khi nội dung đã được chia sẻ với người dùng khác.</p>

        <h3>5.3. Trách nhiệm về Nội dung</h3>
        <p>Bạn chịu trách nhiệm hoàn toàn về Nội dung Người dùng và đảm bảo rằng nội dung không:</p>
        <ul>
            <li>Vi phạm bất kỳ luật hoặc quyền nào của bên thứ ba</li>
            <li>Chứa nội dung bất hợp pháp, gây khiếp sợ, lạm dụng, phỉ báng</li>
            <li>Chứa thông tin sai lệch hoặc gây hiểu nhầm</li>
        </ul>

        <h2>6. Quyền Sở hữu Trí tuệ</h2>
        
        <p>Dịch vụ và tất cả các thành phần (bao gồm nhưng không giới hạn: phần mềm, văn bản, hình ảnh, logo, thương hiệu) là tài sản của chúng tôi hoặc người cấp phép của chúng tôi và được bảo vệ bởi luật sở hữu trí tuệ.</p>

        <p>Bạn không được:</p>
        <ul>
            <li>Sao chép, sửa đổi, phân phối Dịch vụ mà không có sự cho phép</li>
            <li>Sử dụng thương hiệu, logo của chúng tôi mà không có sự đồng ý bằng văn bản</li>
            <li>Xóa hoặc thay đổi bất kỳ thông báo bản quyền nào</li>
        </ul>

        <h2>7. Dịch vụ của Bên thứ ba</h2>
        
        <p>Dịch vụ có thể tích hợp hoặc liên kết đến dịch vụ của bên thứ ba (ví dụ: Google, thanh toán). Chúng tôi không kiểm soát và không chịu trách nhiệm về:</p>
        <ul>
            <li>Nội dung, chính sách bảo mật của các dịch vụ bên thứ ba</li>
            <li>Bất kỳ thiệt hại hoặc tổn thất nào phát sinh từ việc sử dụng dịch vụ bên thứ ba</li>
        </ul>

        <h2>8. Phí và Thanh toán</h2>
        
        <h3>8.1. Dịch vụ Miễn phí</h3>
        <p>Một số tính năng cơ bản của Dịch vụ được cung cấp miễn phí.</p>

        <h3>8.2. Dịch vụ Trả phí (Tương lai)</h3>
        <p>Chúng tôi có thể cung cấp các tính năng cao cấp hoặc dịch vụ trả phí. Khi đó:</p>
        <ul>
            <li>Phí sẽ được công bố rõ ràng trước khi bạn đăng ký</li>
            <li>Bạn đồng ý thanh toán đầy đủ và đúng hạn</li>
            <li>Tất cả phí không hoàn lại trừ khi pháp luật yêu cầu hoặc chúng tôi đồng ý khác</li>
        </ul>

        <h2>9. Chấm dứt</h2>
        
        <h3>9.1. Bởi Bạn</h3>
        <p>Bạn có thể đóng tài khoản bất kỳ lúc nào bằng cách liên hệ với chúng tôi hoặc sử dụng chức năng xóa tài khoản trong ứng dụng.</p>

        <h3>9.2. Bởi Chúng tôi</h3>
        <p>Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản của bạn nếu:</p>
        <ul>
            <li>Bạn vi phạm các Điều khoản này</li>
            <li>Bạn sử dụng Dịch vụ theo cách gây hại hoặc bất hợp pháp</li>
            <li>Chúng tôi phải tuân thủ yêu cầu pháp lý</li>
        </ul>

        <h3>9.3. Hậu quả Chấm dứt</h3>
        <p>Khi tài khoản bị đóng:</p>
        <ul>
            <li>Quyền truy cập của bạn vào Dịch vụ sẽ bị thu hồi</li>
            <li>Nội dung Người dùng có thể bị xóa sau một khoảng thời gian hợp lý</li>
            <li>Các điều khoản về Từ chối Bảo đảm và Giới hạn Trách nhiệm vẫn có hiệu lực</li>
        </ul>

        <h2>10. Từ chối Bảo đảm</h2>
        
        <div class="important">
            <p>DỊCH VỤ ĐƯỢC CUNG CẤP "NGUYÊN TRẠNG" VÀ "NHƯ CÓ SẴN" MÀ KHÔNG CÓ BẤT KỲ BẢO ĐẢM NÀO, RÕ RÀNG HAY NGỤ Ý, BAO GỒM NHƯNG KHÔNG GIỚI HẠN:</p>
            <ul>
                <li>Bảo đảm về khả năng bán được</li>
                <li>Bảo đảm về sự phù hợp cho một mục đích cụ thể</li>
                <li>Bảo đảm về tính chính xác, độ tin cậy</li>
                <li>Bảo đảm về việc không vi phạm</li>
            </ul>
        </div>

        <p>Chúng tôi không đảm bảo rằng:</p>
        <ul>
            <li>Dịch vụ sẽ luôn khả dụng, không bị gián đoạn hoặc không có lỗi</li>
            <li>Kết quả thu được từ Dịch vụ sẽ chính xác hoặc đáng tin cậy</li>
            <li>Bất kỳ lỗi nào sẽ được sửa</li>
        </ul>

        <h2>11. Giới hạn Trách nhiệm</h2>
        
        <div class="important">
            <p>TRONG PHẠM VI TỐI ĐA ĐƯỢC PHÁP LUẬT CHO PHÉP, CHÚNG TÔI VÀ CÁC GIÁM ĐỐC, NHÂN VIÊN, ĐẠI LÝ, ĐỐI TÁC CỦA CHÚNG TÔI SẼ KHÔNG CHỊU TRÁCH NHIỆM VỀ:</p>
            <ul>
                <li>Bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, do hậu quả hay mang tính trừng phạt</li>
                <li>Mất dữ liệu, lợi nhuận, doanh thu, cơ hội kinh doanh</li>
                <li>Gián đoạn hoạt động kinh doanh</li>
            </ul>
            <p>Phát sinh từ hoặc liên quan đến việc sử dụng hoặc không thể sử dụng Dịch vụ, ngay cả khi chúng tôi đã được thông báo về khả năng xảy ra các thiệt hại đó.</p>
        </div>

        <p>Trách nhiệm tổng thể của chúng tôi đối với bạn cho tất cả các khiếu nại liên quan đến Dịch vụ sẽ không vượt quá số tiền lớn hơn giữa: (a) 100 USD, hoặc (b) số tiền bạn đã trả cho chúng tôi trong 12 tháng trước đó.</p>

        <h2>12. Bồi thường</h2>
        
        <p>Bạn đồng ý bồi thường, bảo vệ và giữ cho chúng tôi và các giám đốc, nhân viên, đại lý, đối tác của chúng tôi không bị tổn hại khỏi bất kỳ khiếu nại, trách nhiệm, thiệt hại, tổn thất và chi phí (bao gồm phí luật sư hợp lý) phát sinh từ:</p>
        <ul>
            <li>Vi phạm của bạn đối với các Điều khoản này</li>
            <li>Vi phạm bất kỳ quyền nào của bên thứ ba</li>
            <li>Nội dung Người dùng của bạn</li>
        </ul>

        <h2>13. Giải quyết Tranh chấp</h2>
        
        <h3>13.1. Thương lượng</h3>
        <p>Nếu có tranh chấp, chúng ta sẽ cố gắng giải quyết thông qua thương lượng thiện chí trước.</p>

        <h3>13.2. Luật Áp dụng</h3>
        <p>Các Điều khoản này được điều chỉnh và hiểu theo pháp luật Việt Nam, không kể đến các quy định xung đột pháp luật.</p>

        <h3>13.3. Tài phán</h3>
        <p>Bất kỳ tranh chấp nào phát sinh từ hoặc liên quan đến các Điều khoản này sẽ được giải quyết tại tòa án có thẩm quyền tại Việt Nam.</p>

        <h2>14. Điều khoản Chung</h2>
        
        <h3>14.1. Thay đổi Điều khoản</h3>
        <p>Chúng tôi có quyền sửa đổi các Điều khoản này bất kỳ lúc nào. Khi có thay đổi quan trọng, chúng tôi sẽ:</p>
        <ul>
            <li>Thông báo trong ứng dụng</li>
            <li>Gửi email thông báo</li>
            <li>Cập nhật ngày "Có hiệu lực"</li>
        </ul>
        <p>Việc bạn tiếp tục sử dụng Dịch vụ sau khi thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận các điều khoản mới.</p>

        <h3>14.2. Toàn bộ Thỏa thuận</h3>
        <p>Các Điều khoản này, cùng với Chính sách Bảo mật, tạo thành toàn bộ thỏa thuận giữa bạn và chúng tôi về Dịch vụ.</p>

        <h3>14.3. Từ bỏ Quyền</h3>
        <p>Việc chúng tôi không thực thi bất kỳ quyền hoặc điều khoản nào không được coi là từ bỏ quyền hoặc điều khoản đó.</p>

        <h3>14.4. Tính Khả thi</h3>
        <p>Nếu bất kỳ điều khoản nào được coi là không hợp lệ hoặc không thể thi hành, điều khoản đó sẽ được loại bỏ và các điều khoản còn lại vẫn có hiệu lực.</p>

        <h3>14.5. Chuyển nhượng</h3>
        <p>Bạn không được chuyển nhượng quyền hoặc nghĩa vụ của mình theo các Điều khoản này mà không có sự đồng ý trước bằng văn bản của chúng tôi. Chúng tôi có thể chuyển nhượng quyền của mình cho bất kỳ bên nào.</p>

        <h2>15. Thông báo</h2>
        
        <p>Tất cả thông báo cho bạn sẽ được gửi qua:</p>
        <ul>
            <li>Email đã đăng ký</li>
            <li>Thông báo trong ứng dụng</li>
            <li>Đăng trên website</li>
        </ul>

        <p>Bạn có thể gửi thông báo cho chúng tôi qua email: support@baotienweb.cloud</p>

        <div class="contact-info">
            <h2>16. Liên hệ</h2>
            <p>Nếu bạn có câu hỏi về các Điều khoản Dịch vụ này, vui lòng liên hệ:</p>
            <p><strong>NhàXinh Design</strong></p>
            <p>Email: <a href="mailto:support@baotienweb.cloud">support@baotienweb.cloud</a></p>
            <p>Website: <a href="https://baotienweb.cloud">https://baotienweb.cloud</a></p>
            <p>Địa chỉ: Việt Nam</p>
        </div>

        <div class="footer">
            <p>&copy; 2026 NhàXinh Design. All rights reserved.</p>
            <p><a href="/privacy-policy.html">Chính sách Bảo mật</a> | <a href="/terms-of-service.html">Điều khoản Dịch vụ</a></p>
        </div>
    </div>
</body>
</html>
'@

Write-Host "📝 Preparing to upload files to server..." -ForegroundColor Yellow
Write-Host ""

# SSH command to create files
$sshCommands = @"
# Navigate to web root
cd /var/www/html || cd /usr/share/nginx/html || cd /var/www

# Create privacy-policy.html
cat > privacy-policy.html << 'PRIVACY_EOF'
$privacyPolicy
PRIVACY_EOF

# Create terms-of-service.html
cat > terms-of-service.html << 'TERMS_EOF'
$termsOfService
TERMS_EOF

# Set proper permissions
chmod 644 privacy-policy.html terms-of-service.html

# Verify files were created
echo ""
echo "✅ Files created successfully:"
ls -lh privacy-policy.html terms-of-service.html

echo ""
echo "📋 URLs:"
echo "https://baotienweb.cloud/privacy-policy.html"
echo "https://baotienweb.cloud/terms-of-service.html"
"@

# Save SSH commands to temporary file
$tempFile = [System.IO.Path]::GetTempFileName()
$sshCommands | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "🔐 Connecting to root@103.200.20.100..." -ForegroundColor Cyan
Write-Host "Please enter password when prompted." -ForegroundColor Yellow
Write-Host ""

# Execute SSH commands
ssh root@103.200.20.100 "bash -s" < $tempFile

# Clean up temp file
Remove-Item $tempFile

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Verify files are accessible:" -ForegroundColor Yellow
Write-Host "   https://baotienweb.cloud/privacy-policy.html" -ForegroundColor White
Write-Host "   https://baotienweb.cloud/terms-of-service.html" -ForegroundColor White
Write-Host ""
Write-Host "2. Update Google OAuth Consent Screen:" -ForegroundColor Yellow
Write-Host "   - Go to: https://console.cloud.google.com/apis/credentials/consent" -ForegroundColor White
Write-Host "   - Add Privacy Policy URL" -ForegroundColor White
Write-Host "   - Add Terms of Service URL" -ForegroundColor White
Write-Host ""
Write-Host "3. Save and re-submit for verification" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
