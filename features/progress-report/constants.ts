/**
 * Progress Report Constants
 * Dữ liệu mẫu cho báo cáo tiến độ thi công
 */

import { Task, TaskStatus } from './types';

export const CONSTRUCTION_TASKS: Task[] = [
  {
    id: '1', index: '01', title: 'Khởi công dự án', startDate: '01/01/2026', endDate: '01/01/2026', status: TaskStatus.COMPLETED,
    description: 'Rào chắn/che chắn công trình- Dọn mặt bằng- Định vị tim trục + cốt ±0.000- Kéo điện/nước tạm- Setup bãi vật tư + nội quy/an toàn'
  },
  {
    id: '2', index: '02', title: 'Ép cọc', startDate: '02/01/2026', endDate: '07/01/2026', status: TaskStatus.COMPLETED,
    description: 'Tập kết cọc & kê cọc- Định vị tim cọc- Ép cọc (ép thử/ép đại trà)- Hàn nối/cắt đầu cọc- Ghi nhật ký lực ép/độ chối- Nghiệm thu cọc'
  },
  {
    id: '3', index: '03', title: 'Đào móng', startDate: '08/01/2026', endDate: '10/01/2026', status: TaskStatus.COMPLETED,
    description: 'Căng dây định vị hố móng- Đào đất (máy/thủ công)- Vận chuyển đất thải- Sửa đáy móng đúng cao độ- Bơm nước tạm (nếu có)- Vệ sinh mặt bằng'
  },
  {
    id: '4', index: '04', title: 'Làm thép móng – giằng móng', startDate: '11/01/2026', endDate: '16/01/2026', status: TaskStatus.COMPLETED,
    description: 'Cắt/uốn thép theo bản vẽ- Lắp thép móng + giằng- Đặt con kê/lớp bảo vệ- Lắp thép chờ cột- Buộc thép đúng khoảng cách- Nghiệm thu cốt thép'
  },
  {
    id: '5', index: '05', title: 'Đổ bê tông móng', startDate: '17/01/2026', endDate: '17/01/2026', status: TaskStatus.COMPLETED,
    description: 'Kiểm tra thép + coffa (nếu có)- Đổ bê tông móng/giằng- Đầm dùi- Hoàn thiện bề mặt- Bảo dưỡng bê tông (che phủ/tưới)'
  },
  {
    id: '6', index: '06', title: 'San lấp – đệm nền (hố ga, thoát trệt)', startDate: '18/01/2026', endDate: '20/01/2026', status: TaskStatus.COMPLETED,
    description: 'Đặt ống thoát trệt + hố ga- Lấp cát/đá theo lớp- Đầm chặt từng lớp- Kiểm tra cao độ nền- Tạo rãnh kỹ thuật (nếu có)- Vệ sinh khu vực'
  },
  {
    id: '7', index: '07', title: 'Làm thép sàn tầng trệt', startDate: '21/01/2026', endDate: '24/01/2026', status: TaskStatus.IN_PROGRESS,
    description: 'Lắp coffa sàn (nếu tách riêng)- Lắp thép lớp dưới/lớp trên- Lắp thép tăng cường dầm/ô mở- Đặt con kê- Chừa ống chờ kỹ thuật- Nghiệm thu cốt thép sàn',
    subTasks: [
      { id: '7-1', title: 'Lắp coffa sàn', isCompleted: true },
      { id: '7-2', title: 'Lắp thép lớp dưới/lớp trên', isCompleted: true },
      { id: '7-3', title: 'Lắp thép tăng cường dầm/ô mở', isCompleted: false },
      { id: '7-4', title: 'Nghiệm thu cốt thép sàn', isCompleted: false }
    ]
  },
  {
    id: '8', index: '08', title: 'Coffa + thép cột tầng trệt', startDate: '25/01/2026', endDate: '27/01/2026', status: TaskStatus.PENDING,
    description: 'Lắp dựng thép cột- Đặt đai đúng bước- Dựng coffa cột- Cân chỉnh tim & thẳng đứng- Siết giằng chống xê dịch- Nghiệm thu coffa + thép'
  },
  {
    id: '9', index: '09', title: 'Đổ bê tông sàn tầng trệt', startDate: '28/01/2026', endDate: '28/01/2026', status: TaskStatus.PENDING,
    description: 'Kiểm tra coffa/thép lần cuối- Đổ bê tông dầm-sàn- Đầm dùi- Xoa phẳng mặt sàn- Bảo dưỡng chống nứt'
  },
  {
    id: '10', index: '10', title: 'Xây tường bao tầng trệt', startDate: '29/01/2026', endDate: '04/02/2026', status: TaskStatus.PENDING,
    description: 'Lấy mực/căng dây- Xây tường bao- Chừa ô cửa/ô kỹ thuật- Neo râu tường vào cột- Xây lanh tô (nếu có)- Vệ sinh mạch vữa'
  },
  {
    id: '11', index: '11', title: 'Coffa + thép sàn tầng 1', startDate: '01/02/2026', endDate: '05/02/2026', status: TaskStatus.PENDING,
    description: 'Dựng coffa dầm-sàn- Lắp thép dầm- Lắp thép sàn- Đặt con kê- Chừa ống/hộp kỹ thuật- Nghiệm thu trước khi đổ'
  },
  {
    id: '12', index: '12', title: 'Coffa + thép cột tầng 1', startDate: '06/02/2026', endDate: '08/02/2026', status: TaskStatus.PENDING,
    description: 'Lắp thép cột tầng 1- Đặt đai cột đúng bước- Dựng coffa cột- Cân chỉnh tim & thẳng- Siết giằng- Nghiệm thu coffa + thép'
  },
  {
    id: '13', index: '13', title: 'Đổ bê tông sàn tầng 1', startDate: '09/02/2026', endDate: '09/02/2026', status: TaskStatus.PENDING,
    description: 'Đổ bê tông dầm-sàn tầng 1- Đầm dùi- Xoa phẳng- Bảo dưỡng bê tông'
  },
  {
    id: '14', index: '14', title: 'Xây tường bao tầng 1', startDate: '10/02/2026', endDate: '15/02/2026', status: TaskStatus.PENDING,
    description: 'Xây tường bao- Chừa ô cửa/ô kỹ thuật- Neo râu tường- Kiểm tra thẳng-phẳng- Trám mạch vữa- Vệ sinh khu vực'
  },
  {
    id: '15', index: '15', title: 'Coffa + thép sàn tầng 2', startDate: '12/02/2026', endDate: '16/02/2026', status: TaskStatus.PENDING,
    description: 'Dựng coffa dầm-sàn- Lắp thép dầm- Lắp thép sàn- Đặt con kê- Chừa kỹ thuật- Nghiệm thu trước khi đổ'
  },
  {
    id: '16', index: '16', title: 'Coffa + thép cột tầng 2', startDate: '17/02/2026', endDate: '19/02/2026', status: TaskStatus.PENDING,
    description: 'Lắp thép cột- Dựng coffa- Cân chỉnh tim cột- Siết giằng- Nghiệm thu trước khi đổ'
  },
  {
    id: '17', index: '17', title: 'Đổ bê tông sàn tầng 2', startDate: '20/02/2026', endDate: '20/02/2026', status: TaskStatus.PENDING,
    description: 'Đổ bê tông dầm-sàn- Đầm dùi- Xoa phẳng- Bảo dưỡng'
  },
  {
    id: '18', index: '18', title: 'Xây tường bao tầng 2', startDate: '21/02/2026', endDate: '26/02/2026', status: TaskStatus.PENDING,
    description: 'Xây tường bao- Chừa ô cửa- Neo liên kết- Kiểm tra thẳng-phẳng- Vệ sinh mạch vữa'
  },
  {
    id: '19', index: '19', title: 'Coffa + thép tầng 3', startDate: '24/02/2026', endDate: '26/02/2026', status: TaskStatus.PENDING,
    description: 'Lắp thép cột/dầm tầng 3- Dựng coffa cột/dầm- Cân chỉnh tim- Đặt thép chờ- Nghiệm thu phần chuẩn bị'
  },
  {
    id: '20', index: '20', title: 'Coffa + thép sàn tầng 3', startDate: '27/02/2026', endDate: '03/03/2026', status: TaskStatus.PENDING,
    description: 'Dựng coffa sàn- Lắp thép dầm-sàn- Đặt con kê- Chừa lỗ kỹ thuật (ống, hộp gen)- Kiểm tra cao độ- Nghiệm thu trước khi đổ'
  },
  {
    id: '21', index: '21', title: 'Đổ bê tông sàn mái', startDate: '04/03/2026', endDate: '04/03/2026', status: TaskStatus.PENDING,
    description: 'Đổ bê tông mái- Đầm dùi- Tạo dốc (nếu có)- Xử lý cổ ống xuyên sàn- Bảo dưỡng chống nứt'
  },
  {
    id: '22', index: '22', title: 'Xây tường bao tầng 3', startDate: '05/03/2026', endDate: '09/03/2026', status: TaskStatus.PENDING,
    description: 'Xây tường bao- Chừa ô cửa/ô kỹ thuật- Neo liên kết- Kiểm tra thẳng-phẳng- Vệ sinh mạch vữa'
  },
  {
    id: '23', index: '23', title: 'Xây tường ngăn phòng', startDate: '10/03/2026', endDate: '24/03/2026', status: TaskStatus.PENDING,
    description: 'Bố trí mặt bằng theo bản vẽ- Xây tường ngăn- Chừa ô cửa- Chừa hộp kỹ thuật- Đặt râu/neo liên kết- Kiểm tra kích thước phòng'
  },
  {
    id: '24', index: '24', title: 'Đi hệ thống điện nước (âm)', startDate: '15/03/2026', endDate: '29/03/2026', status: TaskStatus.PENDING,
    description: 'Đi ống điện âm tường/sàn- Đi ống cấp-thoát nước- Đặt hộp công tắc/ổ cắm- Đi ống điều hòa/thoát ngưng (nếu có)- Test kín nước/điện- Trám cố định ống'
  },
  {
    id: '25', index: '25', title: 'Tô trát tường trong nhà', startDate: '25/03/2026', endDate: '12/04/2026', status: TaskStatus.PENDING,
    description: 'Tạo mốc/cữ lấy phẳng- Trát tường/trần trong nhà- Xử lý góc vuông/bo cạnh- Vá nứt/tiếp giáp- Vệ sinh bề mặt'
  },
  {
    id: '26', index: '26', title: 'Tô trát tường ngoài nhà', startDate: '01/04/2026', endDate: '15/04/2026', status: TaskStatus.PENDING,
    description: 'Tạo mốc lấy phẳng- Trát tường ngoài- Dán lưới chống nứt vị trí tiếp giáp- Hoàn thiện bề mặt- Vệ sinh khu vực'
  },
  {
    id: '27', index: '27', title: 'Cán nền – chống thấm WC/ban công', startDate: '10/04/2026', endDate: '22/04/2026', status: TaskStatus.PENDING,
    description: 'Cán nền tạo dốc- Chống thấm WC/ban công/sân thượng- Xử lý cổ ống/phễu thu- Ngâm thử nước (test)- Nghiệm thu chống thấm- Bảo vệ lớp chống thấm'
  },
  {
    id: '28', index: '28', title: 'Ốp gạch WC – bếp', startDate: '18/04/2026', endDate: '05/05/2026', status: TaskStatus.PENDING,
    description: 'Lấy cốt/đường ron- Ốp gạch tường- Cắt gạch góc/len- Chà ron- Keo/ron chống thấm- Vệ sinh hoàn thiện'
  },
  {
    id: '29', index: '29', title: 'Lát gạch sàn các tầng', startDate: '25/04/2026', endDate: '07/05/2026', status: TaskStatus.PENDING,
    description: 'Lấy cốt cao độ- Cán vữa lót- Lát gạch sàn- Canh phẳng/độ dốc khu ướt- Chà ron- Vệ sinh'
  },
  {
    id: '30', index: '30', title: 'Làm trần thạch cao', startDate: '28/04/2026', endDate: '10/05/2026', status: TaskStatus.PENDING,
    description: 'Treo ty/khung xương- Lắp tấm thạch cao- Xử lý mối nối/băng keo- Bả xả nhám toàn thiện- Vệ sinh chuẩn bị sơn'
  },
  {
    id: '31', index: '31', title: 'Sơn nước toàn nhà & chống thấm', startDate: '05/05/2026', endDate: '20/05/2026', status: TaskStatus.PENDING,
    description: 'Bả matit- Chà nhám- Sơn lót- Sơn phủ (2 lớp)- Chống thấm điểm (mái/ban công/tường ngoài)- Dặm vá hoàn thiện'
  },
  {
    id: '32', index: '32', title: 'Lắp cửa đi – cửa sổ', startDate: '12/05/2026', endDate: '20/05/2026', status: TaskStatus.PENDING,
    description: 'Lắp khung- Bơm foam/keo- Lắp cánh & phụ kiện- Cân khe, test đóng mở- Silicone chống thấm- Vệ sinh bề mặt'
  },
  {
    id: '33', index: '33', title: 'Lắp lan can – tay vịn', startDate: '15/05/2026', endDate: '22/05/2026', status: TaskStatus.PENDING,
    description: 'Khoan cấy/bản mã- Lắp trụ/khung- Lắp kính/khung sắt/inox- Siết liên kết- Kiểm tra độ chắc chắn- Vệ sinh'
  },
  {
    id: '34', index: '34', title: 'Hoàn thiện thiết bị điện', startDate: '18/05/2026', endDate: '24/05/2026', status: TaskStatus.PENDING,
    description: 'Lắp công tắc/ổ cắm- Lắp đèn- Lắp CB/tủ điện- Test tải & an toàn- Dán nhãn mạch'
  },
  {
    id: '35', index: '35', title: 'Hoàn thiện thiết bị nước', startDate: '18/05/2026', endDate: '24/05/2026', status: TaskStatus.PENDING,
    description: 'Lắp thiết bị vệ sinh- Đấu nối cấp-thoát- Test áp lực/rò rỉ- Silicone mép thiết bị- Vận hành thử'
  },
  {
    id: '36', index: '36', title: 'Hoàn thiện nội thất cơ bản', startDate: '10/05/2026', endDate: '27/05/2026', status: TaskStatus.PENDING,
    description: 'Lắp tủ bếp/tủ áo/kệ- Lắp mặt đá (nếu có)- Lắp phụ kiện bản lề-ray- Cân chỉnh cánh/tay nắm- Dặm vá/keo chỉ- Vệ sinh sau lắp'
  },
  {
    id: '37', index: '37', title: 'Vệ sinh công nghiệp', startDate: '28/05/2026', endDate: '29/05/2026', status: TaskStatus.PENDING,
    description: 'Vệ sinh sàn/tường- Lau kính- Vệ sinh WC/thiết bị- Bóc băng keo bảo vệ- Hút bụi toàn bộ- Thu gom rác'
  },
  {
    id: '38', index: '38', title: 'Nghiệm thu – bàn giao', startDate: '30/05/2026', endDate: '31/05/2026', status: TaskStatus.PENDING,
    description: 'Test điện-nước/thiết bị- Kiểm tra hoàn thiện- Lập biên bản nghiệm thu- Bàn giao hồ sơ/bảo hành- Hướng dẫn sử dụng'
  }
];
