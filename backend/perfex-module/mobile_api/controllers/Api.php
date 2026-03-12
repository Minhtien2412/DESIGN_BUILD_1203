<?php
/**
 * Mobile API - REST API Controller
 * Các endpoint chính cho ứng dụng mobile
 * 
 * Base URL: https://your-domain.com/api/v1/
 * 
 * Authentication: Header X-API-Key
 * 
 * Endpoints:
 * - POST /auth/login - Đăng nhập
 * - POST /auth/register - Đăng ký
 * - POST /auth/logout - Đăng xuất
 * - GET  /auth/me - Thông tin user hiện tại
 * - POST /auth/change-password - Đổi mật khẩu
 * - POST /auth/update-profile - Cập nhật profile
 * 
 * - GET  /customers - Danh sách khách hàng
 * - GET  /customers/{id} - Chi tiết khách hàng
 * 
 * - GET  /projects - Danh sách dự án
 * - GET  /projects/{id} - Chi tiết dự án
 * - GET  /projects/{id}/tasks - Tasks của dự án
 * - GET  /projects/{id}/files - Files của dự án
 * 
 * - GET  /invoices - Danh sách hóa đơn
 * - GET  /invoices/{id} - Chi tiết hóa đơn
 * 
 * - GET  /estimates - Danh sách báo giá
 * - GET  /estimates/{id} - Chi tiết báo giá
 * 
 * - GET  /tasks - Danh sách tasks
 * - GET  /tasks/{id} - Chi tiết task
 * - POST /tasks/{id}/complete - Hoàn thành task
 * 
 * - GET  /tickets - Danh sách tickets
 * - GET  /tickets/{id} - Chi tiết ticket
 * - POST /tickets/create - Tạo ticket mới
 * - POST /tickets/{id}/reply - Trả lời ticket
 * 
 * - GET  /notifications - Thông báo
 * - POST /notifications/mark-read - Đánh dấu đã đọc
 */

defined('BASEPATH') or exit('No direct script access allowed');

class Api extends CI_Controller
{
    protected $api_key_id = null;
    protected $current_user = null;
    protected $user_type = null; // 'staff' or 'contact'
    
    public function __construct()
    {
        parent::__construct();
        
        // CORS headers
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key, X-User-Type, X-User-Id');
        header('Content-Type: application/json; charset=utf-8');
        
        // Handle preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
        
        // Check if module is enabled
        if (get_option('mobile_api_enabled') !== '1') {
            $this->response(['error' => 'API is disabled'], 503);
        }
        
        // Load models
        $this->load->model('clients_model');
        $this->load->model('projects_model');
        $this->load->model('tasks_model');
        $this->load->model('invoices_model');
        $this->load->model('estimates_model');
        $this->load->model('tickets_model');
        $this->load->model('staff_model');
    }
    
    // ==================== HELPERS ====================
    
    /**
     * Authenticate API request
     */
    protected function authenticate($require_user = false)
    {
        $api_key = $this->input->get_request_header('X-API-Key', TRUE);
        
        if (!$api_key) {
            $api_key = $this->input->get('api_key');
        }
        
        if (!$api_key) {
            $this->response(['error' => 'API Key is required'], 401);
        }
        
        // Validate API key
        $key = $this->db
            ->where('api_key', $api_key)
            ->where('active', 1)
            ->get(db_prefix() . 'mobile_api_keys')
            ->row();
        
        if (!$key) {
            $this->response(['error' => 'Invalid or inactive API Key'], 401);
        }
        
        $this->api_key_id = $key->id;
        
        // Update last used
        $this->db->where('id', $key->id)->update(db_prefix() . 'mobile_api_keys', [
            'last_used' => date('Y-m-d H:i:s'),
        ]);
        
        // Check user authentication if required
        if ($require_user) {
            $user_type = $this->input->get_request_header('X-User-Type', TRUE);
            $user_id = $this->input->get_request_header('X-User-Id', TRUE);
            
            if (!$user_type || !$user_id) {
                $this->response(['error' => 'User authentication required'], 401);
            }
            
            if ($user_type === 'staff') {
                $user = $this->db->where('staffid', $user_id)->where('active', 1)->get('tblstaff')->row();
            } else {
                $user = $this->db->where('id', $user_id)->where('active', 1)->get('tblcontacts')->row();
            }
            
            if (!$user) {
                $this->response(['error' => 'User not found or inactive'], 401);
            }
            
            $this->current_user = $user;
            $this->user_type = $user_type;
        }
        
        // Log request
        $this->log_request();
    }
    
    /**
     * Log API request
     */
    protected function log_request()
    {
        if (get_option('mobile_api_log_requests') !== '1') {
            return;
        }
        
        $this->db->insert(db_prefix() . 'mobile_api_logs', [
            'api_key_id' => $this->api_key_id,
            'endpoint' => uri_string(),
            'method' => $_SERVER['REQUEST_METHOD'],
            'ip_address' => $this->input->ip_address(),
            'user_agent' => $this->input->user_agent(),
            'request_data' => json_encode($this->get_json_input()),
            'response_code' => 200,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
    }
    
    /**
     * JSON Response
     */
    protected function response($data, $status = 200)
    {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();
    }
    
    /**
     * Get JSON input
     */
    protected function get_json_input()
    {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }
    
    /**
     * Pagination helper
     */
    protected function paginate($page = 1, $limit = 20)
    {
        $page = max(1, (int)$page);
        $limit = min(100, max(1, (int)$limit));
        $offset = ($page - 1) * $limit;
        
        return [$offset, $limit, $page];
    }

    // ==================== AUTHENTICATION ====================
    
    /**
     * POST /api/v1/auth/login
     * Đăng nhập (Staff hoặc Customer Contact)
     */
    public function auth_login()
    {
        $this->authenticate();
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->response(['error' => 'Method not allowed'], 405);
        }
        
        $data = $this->get_json_input();
        
        if (empty($data['email']) || empty($data['password'])) {
            $this->response(['error' => 'Email và password là bắt buộc'], 400);
        }
        
        $email = strtolower(trim($data['email']));
        $password = $data['password'];
        
        // Load password helper
        $this->load->helper('phpass');
        $hasher = new PasswordHash(8, TRUE);
        
        // Try Staff login first
        $staff = $this->db->where('email', $email)->where('active', 1)->get('tblstaff')->row();
        
        if ($staff && $hasher->CheckPassword($password, $staff->password)) {
            // Update last login
            $this->db->where('staffid', $staff->staffid)->update('tblstaff', [
                'last_login' => date('Y-m-d H:i:s'),
                'last_ip' => $this->input->ip_address(),
            ]);
            
            $this->response([
                'status' => true,
                'message' => 'Đăng nhập thành công',
                'user_type' => 'staff',
                'user' => [
                    'id' => $staff->staffid,
                    'staff_id' => $staff->staffid,
                    'email' => $staff->email,
                    'firstname' => $staff->firstname,
                    'lastname' => $staff->lastname,
                    'phone' => $staff->phonenumber,
                    'profile_image' => $staff->profile_image ? site_url('uploads/staff_profile_images/' . $staff->staffid . '/thumb_' . $staff->profile_image) : null,
                    'is_staff' => true,
                    'is_admin' => $staff->admin == 1,
                    'role' => $staff->admin == 1 ? 'admin' : 'staff',
                ]
            ]);
        }
        
        // Try Contact (Customer) login
        $this->db->select('c.*, cl.company, cl.userid as customer_id');
        $this->db->from('tblcontacts c');
        $this->db->join('tblclients cl', 'cl.userid = c.userid', 'left');
        $this->db->where('c.email', $email);
        $this->db->where('c.active', 1);
        $contact = $this->db->get()->row();
        
        if ($contact && !empty($contact->password) && $hasher->CheckPassword($password, $contact->password)) {
            // Update last login
            $this->db->where('id', $contact->id)->update('tblcontacts', [
                'last_login' => date('Y-m-d H:i:s'),
                'last_ip' => $this->input->ip_address(),
            ]);
            
            $this->response([
                'status' => true,
                'message' => 'Đăng nhập thành công',
                'user_type' => 'contact',
                'user' => [
                    'id' => $contact->id,
                    'contact_id' => $contact->id,
                    'customer_id' => $contact->customer_id,
                    'email' => $contact->email,
                    'firstname' => $contact->firstname,
                    'lastname' => $contact->lastname,
                    'phone' => $contact->phonenumber,
                    'company' => $contact->company,
                    'profile_image' => $contact->profile_image ? site_url('uploads/client_profile_images/' . $contact->id . '/thumb_' . $contact->profile_image) : null,
                    'is_staff' => false,
                    'is_admin' => false,
                    'role' => 'customer',
                ]
            ]);
        }
        
        $this->response([
            'status' => false,
            'error' => 'Email hoặc mật khẩu không đúng'
        ], 401);
    }
    
    /**
     * POST /api/v1/auth/register
     * Đăng ký tài khoản khách hàng mới
     */
    public function auth_register()
    {
        $this->authenticate();
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->response(['error' => 'Method not allowed'], 405);
        }
        
        // Check if registration is allowed
        if (get_option('mobile_api_allow_registration') !== '1') {
            $this->response(['error' => 'Đăng ký tài khoản đã bị tắt'], 403);
        }
        
        $data = $this->get_json_input();
        
        // Validate required fields
        if (empty($data['email']) || empty($data['password']) || empty($data['firstname'])) {
            $this->response([
                'status' => false,
                'error' => 'Email, password và firstname là bắt buộc'
            ], 400);
        }
        
        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->response([
                'status' => false,
                'error' => 'Email không hợp lệ'
            ], 400);
        }
        
        $email = strtolower(trim($data['email']));
        
        // Check if email exists in contacts
        if ($this->db->where('email', $email)->get('tblcontacts')->row()) {
            $this->response([
                'status' => false,
                'error' => 'Email này đã được đăng ký',
                'code' => 'EMAIL_EXISTS'
            ], 409);
        }
        
        // Check if email exists in staff
        if ($this->db->where('email', $email)->get('tblstaff')->row()) {
            $this->response([
                'status' => false,
                'error' => 'Email này đã được sử dụng',
                'code' => 'EMAIL_EXISTS'
            ], 409);
        }
        
        // Create customer
        $company_name = !empty($data['company']) 
            ? $data['company'] 
            : trim($data['firstname'] . ' ' . ($data['lastname'] ?? ''));
        
        $customer_data = [
            'company' => $company_name,
            'phonenumber' => $data['phone'] ?? '',
            'country' => $data['country'] ?? 0,
            'city' => $data['city'] ?? '',
            'state' => $data['state'] ?? '',
            'address' => $data['address'] ?? '',
            'zip' => $data['zip'] ?? '',
            'active' => 1,
            'datecreated' => date('Y-m-d H:i:s'),
            'addedfrom' => 0, // API
        ];
        
        $customer_id = $this->clients_model->add($customer_data);
        
        if (!$customer_id) {
            $this->response([
                'status' => false,
                'error' => 'Không thể tạo tài khoản khách hàng'
            ], 500);
        }
        
        // Hash password
        $this->load->helper('phpass');
        $hasher = new PasswordHash(8, TRUE);
        $hashed_password = $hasher->HashPassword($data['password']);
        
        // Create contact
        $contact_data = [
            'userid' => $customer_id,
            'firstname' => $data['firstname'],
            'lastname' => $data['lastname'] ?? '',
            'email' => $email,
            'phonenumber' => $data['phone'] ?? '',
            'password' => $hashed_password,
            'is_primary' => 1,
            'active' => 1,
            'datecreated' => date('Y-m-d H:i:s'),
            'email_verified_at' => date('Y-m-d H:i:s'),
        ];
        
        $contact_id = $this->clients_model->add_contact($contact_data, $customer_id);
        
        if (!$contact_id) {
            // Rollback
            $this->clients_model->delete($customer_id);
            $this->response([
                'status' => false,
                'error' => 'Không thể tạo thông tin đăng nhập'
            ], 500);
        }
        
        $this->response([
            'status' => true,
            'message' => 'Đăng ký thành công',
            'user_type' => 'contact',
            'user' => [
                'id' => $contact_id,
                'contact_id' => $contact_id,
                'customer_id' => $customer_id,
                'email' => $email,
                'firstname' => $data['firstname'],
                'lastname' => $data['lastname'] ?? '',
                'phone' => $data['phone'] ?? '',
                'company' => $company_name,
                'is_staff' => false,
                'is_admin' => false,
                'role' => 'customer',
            ]
        ], 201);
    }
    
    /**
     * GET /api/v1/auth/me
     * Lấy thông tin user hiện tại
     */
    public function auth_me()
    {
        $this->authenticate(true);
        
        if ($this->user_type === 'staff') {
            $user = $this->current_user;
            $this->response([
                'status' => true,
                'user_type' => 'staff',
                'user' => [
                    'id' => $user->staffid,
                    'staff_id' => $user->staffid,
                    'email' => $user->email,
                    'firstname' => $user->firstname,
                    'lastname' => $user->lastname,
                    'phone' => $user->phonenumber,
                    'profile_image' => $user->profile_image ? site_url('uploads/staff_profile_images/' . $user->staffid . '/thumb_' . $user->profile_image) : null,
                    'is_staff' => true,
                    'is_admin' => $user->admin == 1,
                    'role' => $user->admin == 1 ? 'admin' : 'staff',
                ]
            ]);
        } else {
            $user = $this->current_user;
            
            // Get customer info
            $customer = $this->db->where('userid', $user->userid)->get('tblclients')->row();
            
            $this->response([
                'status' => true,
                'user_type' => 'contact',
                'user' => [
                    'id' => $user->id,
                    'contact_id' => $user->id,
                    'customer_id' => $user->userid,
                    'email' => $user->email,
                    'firstname' => $user->firstname,
                    'lastname' => $user->lastname,
                    'phone' => $user->phonenumber,
                    'company' => $customer ? $customer->company : '',
                    'profile_image' => $user->profile_image ? site_url('uploads/client_profile_images/' . $user->id . '/thumb_' . $user->profile_image) : null,
                    'is_staff' => false,
                    'is_admin' => false,
                    'role' => 'customer',
                ]
            ]);
        }
    }
    
    /**
     * POST /api/v1/auth/change-password
     */
    public function auth_change_password()
    {
        $this->authenticate(true);
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->response(['error' => 'Method not allowed'], 405);
        }
        
        $data = $this->get_json_input();
        
        if (empty($data['old_password']) || empty($data['new_password'])) {
            $this->response(['error' => 'old_password và new_password là bắt buộc'], 400);
        }
        
        if (strlen($data['new_password']) < 6) {
            $this->response(['error' => 'Mật khẩu mới phải có ít nhất 6 ký tự'], 400);
        }
        
        $this->load->helper('phpass');
        $hasher = new PasswordHash(8, TRUE);
        
        // Verify old password
        if (!$hasher->CheckPassword($data['old_password'], $this->current_user->password)) {
            $this->response(['status' => false, 'error' => 'Mật khẩu cũ không đúng'], 401);
        }
        
        $new_hash = $hasher->HashPassword($data['new_password']);
        
        if ($this->user_type === 'staff') {
            $this->db->where('staffid', $this->current_user->staffid)->update('tblstaff', ['password' => $new_hash]);
        } else {
            $this->db->where('id', $this->current_user->id)->update('tblcontacts', ['password' => $new_hash]);
        }
        
        $this->response(['status' => true, 'message' => 'Đổi mật khẩu thành công']);
    }

    // ==================== PROJECTS ====================
    
    /**
     * GET /api/v1/projects
     */
    public function projects($id = null)
    {
        $this->authenticate(true);
        
        if ($id) {
            return $this->project_detail($id);
        }
        
        $page = $this->input->get('page') ?: 1;
        $limit = $this->input->get('limit') ?: 20;
        list($offset, $limit, $page) = $this->paginate($page, $limit);
        
        $this->db->select('p.*, c.company as client_name');
        $this->db->from('tblprojects p');
        $this->db->join('tblclients c', 'c.userid = p.clientid', 'left');
        
        // Filter by user
        if ($this->user_type === 'contact') {
            $this->db->where('p.clientid', $this->current_user->userid);
        }
        
        // Status filter
        if ($status = $this->input->get('status')) {
            $this->db->where('p.status', $status);
        }
        
        $total = $this->db->count_all_results('', false);
        
        $this->db->limit($limit, $offset);
        $this->db->order_by('p.id', 'DESC');
        $projects = $this->db->get()->result_array();
        
        // Add status labels
        $status_labels = [
            1 => 'Chưa bắt đầu',
            2 => 'Đang thực hiện',
            3 => 'Tạm dừng',
            4 => 'Đã hủy',
            5 => 'Hoàn thành',
        ];
        
        foreach ($projects as &$p) {
            $p['status_label'] = $status_labels[$p['status']] ?? 'Không xác định';
        }
        
        $this->response([
            'status' => true,
            'data' => $projects,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit),
            ]
        ]);
    }
    
    /**
     * Project detail
     */
    protected function project_detail($id)
    {
        $project = $this->projects_model->get($id);
        
        if (!$project) {
            $this->response(['error' => 'Không tìm thấy dự án'], 404);
        }
        
        // Check permission
        if ($this->user_type === 'contact' && $project->clientid != $this->current_user->userid) {
            $this->response(['error' => 'Không có quyền truy cập'], 403);
        }
        
        // Get tasks
        $tasks = $this->db
            ->where('rel_type', 'project')
            ->where('rel_id', $id)
            ->get('tbltasks')
            ->result_array();
        
        // Get members
        $members = $this->projects_model->get_project_members($id);
        
        // Get files
        $files = $this->db
            ->where('rel_id', $id)
            ->where('rel_type', 'project')
            ->get('tblfiles')
            ->result_array();
        
        $this->response([
            'status' => true,
            'data' => $project,
            'tasks' => $tasks,
            'members' => $members,
            'files' => $files,
        ]);
    }
    
    /**
     * GET /api/v1/projects/{id}/tasks
     */
    public function project_tasks($project_id)
    {
        $this->authenticate(true);
        
        $project = $this->projects_model->get($project_id);
        
        if (!$project) {
            $this->response(['error' => 'Không tìm thấy dự án'], 404);
        }
        
        if ($this->user_type === 'contact' && $project->clientid != $this->current_user->userid) {
            $this->response(['error' => 'Không có quyền truy cập'], 403);
        }
        
        $tasks = $this->db
            ->where('rel_type', 'project')
            ->where('rel_id', $project_id)
            ->order_by('id', 'DESC')
            ->get('tbltasks')
            ->result_array();
        
        $this->response([
            'status' => true,
            'data' => $tasks,
        ]);
    }

    // ==================== INVOICES ====================
    
    /**
     * GET /api/v1/invoices
     */
    public function invoices($id = null)
    {
        $this->authenticate(true);
        
        if ($id) {
            return $this->invoice_detail($id);
        }
        
        $page = $this->input->get('page') ?: 1;
        $limit = $this->input->get('limit') ?: 20;
        list($offset, $limit, $page) = $this->paginate($page, $limit);
        
        $this->db->select('i.*, c.company as client_name');
        $this->db->from('tblinvoices i');
        $this->db->join('tblclients c', 'c.userid = i.clientid', 'left');
        
        if ($this->user_type === 'contact') {
            $this->db->where('i.clientid', $this->current_user->userid);
        }
        
        $total = $this->db->count_all_results('', false);
        
        $this->db->limit($limit, $offset);
        $this->db->order_by('i.id', 'DESC');
        $invoices = $this->db->get()->result_array();
        
        $this->response([
            'status' => true,
            'data' => $invoices,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
            ]
        ]);
    }
    
    /**
     * Invoice detail
     */
    protected function invoice_detail($id)
    {
        $invoice = $this->invoices_model->get($id);
        
        if (!$invoice) {
            $this->response(['error' => 'Không tìm thấy hóa đơn'], 404);
        }
        
        if ($this->user_type === 'contact' && $invoice->clientid != $this->current_user->userid) {
            $this->response(['error' => 'Không có quyền truy cập'], 403);
        }
        
        // Get items
        $items = $this->db->where('rel_id', $id)->where('rel_type', 'invoice')->get('tblitems_in')->result_array();
        
        // Get payments
        $payments = $this->db->where('invoiceid', $id)->get('tblinvoicepaymentrecords')->result_array();
        
        $this->response([
            'status' => true,
            'data' => $invoice,
            'items' => $items,
            'payments' => $payments,
        ]);
    }

    // ==================== ESTIMATES ====================
    
    /**
     * GET /api/v1/estimates
     */
    public function estimates($id = null)
    {
        $this->authenticate(true);
        
        if ($id) {
            return $this->estimate_detail($id);
        }
        
        $page = $this->input->get('page') ?: 1;
        $limit = $this->input->get('limit') ?: 20;
        list($offset, $limit, $page) = $this->paginate($page, $limit);
        
        $this->db->select('e.*, c.company as client_name');
        $this->db->from('tblestimates e');
        $this->db->join('tblclients c', 'c.userid = e.clientid', 'left');
        
        if ($this->user_type === 'contact') {
            $this->db->where('e.clientid', $this->current_user->userid);
        }
        
        $total = $this->db->count_all_results('', false);
        
        $this->db->limit($limit, $offset);
        $this->db->order_by('e.id', 'DESC');
        $estimates = $this->db->get()->result_array();
        
        $this->response([
            'status' => true,
            'data' => $estimates,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
            ]
        ]);
    }
    
    /**
     * Estimate detail
     */
    protected function estimate_detail($id)
    {
        $estimate = $this->estimates_model->get($id);
        
        if (!$estimate) {
            $this->response(['error' => 'Không tìm thấy báo giá'], 404);
        }
        
        if ($this->user_type === 'contact' && $estimate->clientid != $this->current_user->userid) {
            $this->response(['error' => 'Không có quyền truy cập'], 403);
        }
        
        $items = $this->db->where('rel_id', $id)->where('rel_type', 'estimate')->get('tblitems_in')->result_array();
        
        $this->response([
            'status' => true,
            'data' => $estimate,
            'items' => $items,
        ]);
    }

    // ==================== TASKS ====================
    
    /**
     * GET /api/v1/tasks
     */
    public function tasks($id = null)
    {
        $this->authenticate(true);
        
        if ($id) {
            return $this->task_detail($id);
        }
        
        $page = $this->input->get('page') ?: 1;
        $limit = $this->input->get('limit') ?: 20;
        list($offset, $limit, $page) = $this->paginate($page, $limit);
        
        $this->db->select('*');
        $this->db->from('tbltasks');
        
        // Filter by project for contacts
        if ($this->user_type === 'contact') {
            $project_ids = $this->db->select('id')->where('clientid', $this->current_user->userid)->get('tblprojects')->result_array();
            $project_ids = array_column($project_ids, 'id');
            
            if (!empty($project_ids)) {
                $this->db->where('rel_type', 'project');
                $this->db->where_in('rel_id', $project_ids);
            } else {
                $this->response(['status' => true, 'data' => [], 'pagination' => ['total' => 0]]);
            }
        }
        
        $total = $this->db->count_all_results('', false);
        
        $this->db->limit($limit, $offset);
        $this->db->order_by('id', 'DESC');
        $tasks = $this->db->get()->result_array();
        
        $this->response([
            'status' => true,
            'data' => $tasks,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
            ]
        ]);
    }
    
    /**
     * Task detail
     */
    protected function task_detail($id)
    {
        $task = $this->tasks_model->get($id);
        
        if (!$task) {
            $this->response(['error' => 'Không tìm thấy task'], 404);
        }
        
        $this->response([
            'status' => true,
            'data' => $task,
        ]);
    }

    // ==================== TICKETS ====================
    
    /**
     * GET /api/v1/tickets
     */
    public function tickets($id = null)
    {
        $this->authenticate(true);
        
        if ($id) {
            return $this->ticket_detail($id);
        }
        
        $page = $this->input->get('page') ?: 1;
        $limit = $this->input->get('limit') ?: 20;
        list($offset, $limit, $page) = $this->paginate($page, $limit);
        
        $this->db->select('*');
        $this->db->from('tbltickets');
        
        if ($this->user_type === 'contact') {
            $this->db->where('userid', $this->current_user->userid);
            $this->db->where('contactid', $this->current_user->id);
        }
        
        $total = $this->db->count_all_results('', false);
        
        $this->db->limit($limit, $offset);
        $this->db->order_by('ticketid', 'DESC');
        $tickets = $this->db->get()->result_array();
        
        $this->response([
            'status' => true,
            'data' => $tickets,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
            ]
        ]);
    }
    
    /**
     * Ticket detail
     */
    protected function ticket_detail($id)
    {
        $ticket = $this->tickets_model->get($id);
        
        if (!$ticket) {
            $this->response(['error' => 'Không tìm thấy ticket'], 404);
        }
        
        if ($this->user_type === 'contact' && 
            ($ticket->userid != $this->current_user->userid || $ticket->contactid != $this->current_user->id)) {
            $this->response(['error' => 'Không có quyền truy cập'], 403);
        }
        
        // Get replies
        $replies = $this->db->where('ticketid', $id)->order_by('date', 'ASC')->get('tblticketreplies')->result_array();
        
        $this->response([
            'status' => true,
            'data' => $ticket,
            'replies' => $replies,
        ]);
    }
    
    /**
     * POST /api/v1/tickets/create
     */
    public function tickets_create()
    {
        $this->authenticate(true);
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->response(['error' => 'Method not allowed'], 405);
        }
        
        $data = $this->get_json_input();
        
        if (empty($data['subject']) || empty($data['message'])) {
            $this->response(['error' => 'Tiêu đề và nội dung là bắt buộc'], 400);
        }
        
        $ticket_data = [
            'userid' => $this->user_type === 'contact' ? $this->current_user->userid : 0,
            'contactid' => $this->user_type === 'contact' ? $this->current_user->id : 0,
            'name' => $this->current_user->firstname . ' ' . ($this->current_user->lastname ?? ''),
            'email' => $this->current_user->email,
            'department' => $data['department'] ?? 0,
            'priority' => $data['priority'] ?? 2,
            'subject' => $data['subject'],
            'message' => $data['message'],
            'status' => 1,
            'date' => date('Y-m-d H:i:s'),
        ];
        
        $ticket_id = $this->tickets_model->add($ticket_data, false, false);
        
        if ($ticket_id) {
            $this->response([
                'status' => true,
                'message' => 'Ticket đã được tạo',
                'ticket_id' => $ticket_id,
            ], 201);
        }
        
        $this->response(['error' => 'Không thể tạo ticket'], 500);
    }

    // ==================== CUSTOMERS ====================
    
    /**
     * GET /api/v1/customers (Staff only)
     */
    public function customers($id = null)
    {
        $this->authenticate(true);
        
        if ($this->user_type !== 'staff') {
            $this->response(['error' => 'Staff access required'], 403);
        }
        
        if ($id) {
            $customer = $this->clients_model->get($id);
            if (!$customer) {
                $this->response(['error' => 'Không tìm thấy khách hàng'], 404);
            }
            
            $contacts = $this->clients_model->get_contacts($id);
            
            $this->response([
                'status' => true,
                'data' => $customer,
                'contacts' => $contacts,
            ]);
        }
        
        $page = $this->input->get('page') ?: 1;
        $limit = $this->input->get('limit') ?: 20;
        list($offset, $limit, $page) = $this->paginate($page, $limit);
        
        $this->db->from('tblclients');
        $total = $this->db->count_all_results('', false);
        
        $this->db->limit($limit, $offset);
        $this->db->order_by('userid', 'DESC');
        $customers = $this->db->get()->result_array();
        
        $this->response([
            'status' => true,
            'data' => $customers,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
            ]
        ]);
    }

    // ==================== DASHBOARD / STATS ====================
    
    /**
     * GET /api/v1/dashboard
     */
    public function dashboard()
    {
        $this->authenticate(true);
        
        $stats = [];
        
        if ($this->user_type === 'staff') {
            // Staff dashboard
            $stats['total_customers'] = $this->db->count_all('tblclients');
            $stats['total_projects'] = $this->db->count_all('tblprojects');
            $stats['total_invoices'] = $this->db->count_all('tblinvoices');
            $stats['total_tasks'] = $this->db->count_all('tbltasks');
            
            $stats['active_projects'] = $this->db->where('status', 2)->from('tblprojects')->count_all_results();
            $stats['pending_tasks'] = $this->db->where('status !=', 5)->from('tbltasks')->count_all_results();
            
            // Recent activities
            $stats['recent_projects'] = $this->db->order_by('id', 'DESC')->limit(5)->get('tblprojects')->result_array();
        } else {
            // Customer dashboard
            $customer_id = $this->current_user->userid;
            
            $stats['my_projects'] = $this->db->where('clientid', $customer_id)->from('tblprojects')->count_all_results();
            $stats['my_invoices'] = $this->db->where('clientid', $customer_id)->from('tblinvoices')->count_all_results();
            $stats['my_estimates'] = $this->db->where('clientid', $customer_id)->from('tblestimates')->count_all_results();
            $stats['my_tickets'] = $this->db->where('userid', $customer_id)->from('tbltickets')->count_all_results();
            
            // Unpaid invoices
            $stats['unpaid_invoices'] = $this->db
                ->where('clientid', $customer_id)
                ->where('status !=', 2) // 2 = paid
                ->from('tblinvoices')
                ->count_all_results();
            
            // Recent projects
            $stats['recent_projects'] = $this->db
                ->where('clientid', $customer_id)
                ->order_by('id', 'DESC')
                ->limit(5)
                ->get('tblprojects')
                ->result_array();
        }
        
        $this->response([
            'status' => true,
            'data' => $stats,
        ]);
    }

    // ==================== KNOWLEDGE BASE ====================
    
    /**
     * GET /api/v1/knowledge-base
     */
    public function knowledge_base($slug = null)
    {
        $this->authenticate();
        
        if ($slug) {
            // Get single article
            $article = $this->db
                ->where('slug', $slug)
                ->where('active', 1)
                ->get('tblknowledgebase')
                ->row();
            
            if (!$article) {
                $this->response(['error' => 'Không tìm thấy bài viết'], 404);
            }
            
            // Update views
            $this->db->where('articleid', $article->articleid)->set('views', 'views+1', FALSE)->update('tblknowledgebase');
            
            $this->response([
                'status' => true,
                'data' => $article,
            ]);
        }
        
        // Get groups
        $groups = $this->db
            ->where('active', 1)
            ->order_by('group_order', 'ASC')
            ->get('tblknowledgebasegroups')
            ->result_array();
        
        foreach ($groups as &$group) {
            $group['articles'] = $this->db
                ->where('articlegroup', $group['groupid'])
                ->where('active', 1)
                ->order_by('article_order', 'ASC')
                ->get('tblknowledgebase')
                ->result_array();
        }
        
        $this->response([
            'status' => true,
            'data' => $groups,
        ]);
    }
}
