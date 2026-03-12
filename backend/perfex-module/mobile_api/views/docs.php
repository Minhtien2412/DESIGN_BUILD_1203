<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php init_head(); ?>
<style>
.api-section { margin-bottom: 30px; }
.api-section h5 { color: #333; border-bottom: 2px solid #4c87c5; padding-bottom: 10px; }
.endpoint-card { background: #f8f9fa; border-left: 4px solid #4c87c5; padding: 15px; margin-bottom: 15px; }
.endpoint-card.post { border-left-color: #28a745; }
.endpoint-card.get { border-left-color: #007bff; }
.endpoint-card.delete { border-left-color: #dc3545; }
.method-badge { display: inline-block; padding: 3px 8px; border-radius: 3px; color: #fff; font-weight: bold; margin-right: 10px; font-size: 12px; }
.method-badge.get { background: #007bff; }
.method-badge.post { background: #28a745; }
.method-badge.delete { background: #dc3545; }
.endpoint-url { font-family: monospace; font-size: 14px; }
pre.code-block { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; overflow-x: auto; }
pre.code-block .string { color: #ce9178; }
pre.code-block .key { color: #9cdcfe; }
pre.code-block .comment { color: #6a9955; }
</style>

<div id="wrapper">
    <div class="content">
        <div class="row">
            <div class="col-md-10 col-md-offset-1">
                <div class="panel_s">
                    <div class="panel-body">
                        <h4 class="no-margin font-bold">
                            <i class="fa fa-book"></i> Mobile API - Tài liệu API
                        </h4>
                        <hr class="hr-panel-heading" />
                        
                        <!-- Overview -->
                        <div class="api-section">
                            <h5>📌 Tổng quan</h5>
                            <table class="table table-bordered">
                                <tr>
                                    <td><strong>Base URL</strong></td>
                                    <td><code><?php echo $base_url; ?></code></td>
                                </tr>
                                <tr>
                                    <td><strong>Authentication</strong></td>
                                    <td>Header: <code>X-API-Key: YOUR_API_KEY</code></td>
                                </tr>
                                <tr>
                                    <td><strong>User Auth</strong></td>
                                    <td>
                                        Headers: <code>X-User-Type: staff|contact</code><br>
                                        <code>X-User-Id: USER_ID</code>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Content-Type</strong></td>
                                    <td><code>application/json</code></td>
                                </tr>
                            </table>
                        </div>
                        
                        <!-- Authentication -->
                        <div class="api-section">
                            <h5>🔐 Authentication</h5>
                            
                            <div class="endpoint-card post">
                                <span class="method-badge post">POST</span>
                                <span class="endpoint-url">/auth/login</span>
                                <p class="text-muted mtop10">Đăng nhập (Staff hoặc Customer)</p>
                                <strong>Request Body:</strong>
<pre class="code-block">{
  "email": "user@example.com",
  "password": "123456"
}</pre>
                                <strong>Response:</strong>
<pre class="code-block">{
  "status": true,
  "message": "Đăng nhập thành công",
  "user_type": "contact",
  "user": {
    "id": 1,
    "contact_id": 1,
    "customer_id": 5,
    "email": "user@example.com",
    "firstname": "Nguyen",
    "lastname": "Van A",
    "is_staff": false,
    "role": "customer"
  }
}</pre>
                            </div>
                            
                            <div class="endpoint-card post">
                                <span class="method-badge post">POST</span>
                                <span class="endpoint-url">/auth/register</span>
                                <p class="text-muted mtop10">Đăng ký tài khoản khách hàng mới</p>
                                <strong>Request Body:</strong>
<pre class="code-block">{
  "email": "newuser@example.com",
  "password": "123456",
  "firstname": "Nguyen",
  "lastname": "Van B",
  "phone": "0901234567",
  "company": "Công ty ABC"  // optional
}</pre>
                            </div>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/auth/me</span>
                                <p class="text-muted mtop10">Lấy thông tin user hiện tại (cần X-User-Type, X-User-Id headers)</p>
                            </div>
                            
                            <div class="endpoint-card post">
                                <span class="method-badge post">POST</span>
                                <span class="endpoint-url">/auth/change-password</span>
                                <p class="text-muted mtop10">Đổi mật khẩu</p>
                                <strong>Request Body:</strong>
<pre class="code-block">{
  "old_password": "123456",
  "new_password": "newpass123"
}</pre>
                            </div>
                        </div>
                        
                        <!-- Projects -->
                        <div class="api-section">
                            <h5>📂 Projects (Dự án)</h5>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/projects</span>
                                <p class="text-muted mtop10">Danh sách dự án</p>
                                <strong>Query params:</strong> <code>page</code>, <code>limit</code>, <code>status</code>
                            </div>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/projects/{id}</span>
                                <p class="text-muted mtop10">Chi tiết dự án (bao gồm tasks, members, files)</p>
                            </div>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/projects/{id}/tasks</span>
                                <p class="text-muted mtop10">Danh sách tasks của dự án</p>
                            </div>
                        </div>
                        
                        <!-- Invoices -->
                        <div class="api-section">
                            <h5>💰 Invoices (Hóa đơn)</h5>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/invoices</span>
                                <p class="text-muted mtop10">Danh sách hóa đơn</p>
                            </div>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/invoices/{id}</span>
                                <p class="text-muted mtop10">Chi tiết hóa đơn (bao gồm items, payments)</p>
                            </div>
                        </div>
                        
                        <!-- Estimates -->
                        <div class="api-section">
                            <h5>📋 Estimates (Báo giá)</h5>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/estimates</span>
                                <p class="text-muted mtop10">Danh sách báo giá</p>
                            </div>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/estimates/{id}</span>
                                <p class="text-muted mtop10">Chi tiết báo giá</p>
                            </div>
                        </div>
                        
                        <!-- Tasks -->
                        <div class="api-section">
                            <h5>✅ Tasks</h5>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/tasks</span>
                                <p class="text-muted mtop10">Danh sách tasks</p>
                            </div>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/tasks/{id}</span>
                                <p class="text-muted mtop10">Chi tiết task</p>
                            </div>
                        </div>
                        
                        <!-- Tickets -->
                        <div class="api-section">
                            <h5>🎫 Tickets (Hỗ trợ)</h5>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/tickets</span>
                                <p class="text-muted mtop10">Danh sách tickets</p>
                            </div>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/tickets/{id}</span>
                                <p class="text-muted mtop10">Chi tiết ticket (bao gồm replies)</p>
                            </div>
                            
                            <div class="endpoint-card post">
                                <span class="method-badge post">POST</span>
                                <span class="endpoint-url">/tickets/create</span>
                                <p class="text-muted mtop10">Tạo ticket mới</p>
                                <strong>Request Body:</strong>
<pre class="code-block">{
  "subject": "Tiêu đề ticket",
  "message": "Nội dung chi tiết...",
  "department": 1,  // optional
  "priority": 2     // optional: 1=Low, 2=Medium, 3=High
}</pre>
                            </div>
                        </div>
                        
                        <!-- Dashboard -->
                        <div class="api-section">
                            <h5>📊 Dashboard</h5>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/dashboard</span>
                                <p class="text-muted mtop10">Thống kê tổng quan (khác nhau cho Staff và Customer)</p>
                            </div>
                        </div>
                        
                        <!-- Customers (Staff only) -->
                        <div class="api-section">
                            <h5>👥 Customers (Chỉ Staff)</h5>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/customers</span>
                                <p class="text-muted mtop10">Danh sách khách hàng</p>
                            </div>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/customers/{id}</span>
                                <p class="text-muted mtop10">Chi tiết khách hàng</p>
                            </div>
                        </div>
                        
                        <!-- Knowledge Base -->
                        <div class="api-section">
                            <h5>📚 Knowledge Base</h5>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/knowledge-base</span>
                                <p class="text-muted mtop10">Danh sách nhóm bài viết</p>
                            </div>
                            
                            <div class="endpoint-card get">
                                <span class="method-badge get">GET</span>
                                <span class="endpoint-url">/knowledge-base/{slug}</span>
                                <p class="text-muted mtop10">Chi tiết bài viết</p>
                            </div>
                        </div>
                        
                        <!-- Example -->
                        <div class="api-section">
                            <h5>💻 Ví dụ sử dụng (cURL)</h5>
<pre class="code-block"><span class="comment"># Login</span>
curl -X POST "<?php echo $base_url; ?>/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <?php echo $example_key; ?>" \
  -d '{"email":"test@example.com","password":"123456"}'

<span class="comment"># Get projects (after login)</span>
curl -X GET "<?php echo $base_url; ?>/projects" \
  -H "X-API-Key: <?php echo $example_key; ?>" \
  -H "X-User-Type: contact" \
  -H "X-User-Id: 1"

<span class="comment"># Create ticket</span>
curl -X POST "<?php echo $base_url; ?>/tickets/create" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <?php echo $example_key; ?>" \
  -H "X-User-Type: contact" \
  -H "X-User-Id: 1" \
  -d '{"subject":"Test ticket","message":"Nội dung test"}'</pre>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php init_tail(); ?>
