<?php
/**
 * Custom API Controller cho Perfex CRM
 * Bypass API Module - Không cần license key
 * 
 * HƯỚNG DẪN CÀI ĐẶT:
 * 1. Upload file này vào: /home/nhaxinhd/thietkeresort.com.vn/perfex_crm/application/controllers/
 * 2. Đổi API_SECRET_KEY bên dưới thành key riêng của bạn
 * 3. Test: https://thietkeresort.com.vn/perfex_crm/custom_api/test
 * 
 * @author ThietKeResort Team
 * @version 1.0.0
 * @date 2025-12-30
 */

defined('BASEPATH') or exit('No direct script access allowed');

class Custom_api extends CI_Controller
{
    // ĐỔI KEY NÀY THÀNH KEY RIÊNG CỦA BẠN
    private $API_SECRET_KEY = '67890abcdef!@#$%^&*';
    
    public function __construct()
    {
        parent::__construct();
        
        // Load các model cần thiết
        $this->load->model('clients_model');
        $this->load->model('projects_model');
        $this->load->model('tasks_model');
        $this->load->model('invoices_model');
        $this->load->model('estimates_model');
        $this->load->model('leads_model');
        $this->load->model('staff_model');
        
        // CORS headers
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');
        header('Content-Type: application/json; charset=utf-8');
        
        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
    
    /**
     * Xác thực API Key
     */
    private function authenticate()
    {
        $api_key = $this->input->get_request_header('X-API-Key', TRUE);
        
        if (!$api_key) {
            $api_key = $this->input->get('api_key');
        }
        
        if ($api_key !== $this->API_SECRET_KEY) {
            $this->json_response(['error' => 'Unauthorized', 'message' => 'Invalid API Key'], 401);
        }
    }
    
    /**
     * JSON Response helper
     */
    private function json_response($data, $status_code = 200)
    {
        http_response_code($status_code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    /**
     * Get POST JSON data
     */
    private function get_json_input()
    {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }

    // ==================== TEST ENDPOINT ====================
    
    /**
     * Test connection
     * GET /custom_api/test
     */
    public function test()
    {
        $this->json_response([
            'status' => true,
            'message' => 'Perfex CRM Custom API is working!',
            'version' => '1.0.0',
            'perfex_version' => get_perfex_version(),
            'timestamp' => date('Y-m-d H:i:s'),
        ]);
    }

    // ==================== CUSTOMERS (CLIENTS) ====================
    
    /**
     * Lấy danh sách khách hàng
     * GET /custom_api/customers
     */
    public function customers()
    {
        $this->authenticate();
        
        $page = $this->input->get('page') ?? 1;
        $limit = $this->input->get('limit') ?? 20;
        $search = $this->input->get('search');
        
        $offset = ($page - 1) * $limit;
        
        // Build query
        $this->db->select('*');
        $this->db->from('tblclients');
        
        if ($search) {
            $this->db->group_start();
            $this->db->like('company', $search);
            $this->db->or_like('vat', $search);
            $this->db->or_like('phonenumber', $search);
            $this->db->group_end();
        }
        
        // Get total
        $total = $this->db->count_all_results('', false);
        
        // Get data
        $this->db->limit($limit, $offset);
        $customers = $this->db->get()->result_array();
        
        $this->json_response([
            'status' => true,
            'data' => $customers,
            'total' => $total,
            'page' => (int)$page,
            'limit' => (int)$limit,
        ]);
    }
    
    /**
     * Lấy chi tiết khách hàng
     * GET /custom_api/customer/{id}
     */
    public function customer($id = null)
    {
        $this->authenticate();
        
        if (!$id) {
            $this->json_response(['error' => 'Customer ID required'], 400);
        }
        
        $customer = $this->clients_model->get($id);
        
        if (!$customer) {
            $this->json_response(['error' => 'Customer not found'], 404);
        }
        
        // Get contacts
        $contacts = $this->clients_model->get_contacts($id);
        
        $this->json_response([
            'status' => true,
            'data' => $customer,
            'contacts' => $contacts,
        ]);
    }
    
    /**
     * Tạo khách hàng mới
     * POST /custom_api/customers/create
     */
    public function customers_create()
    {
        $this->authenticate();
        
        $data = $this->get_json_input();
        
        if (empty($data['company'])) {
            $this->json_response(['error' => 'Company name is required'], 400);
        }
        
        $customer_data = [
            'company' => $data['company'],
            'vat' => $data['vat'] ?? '',
            'phonenumber' => $data['phone'] ?? '',
            'country' => $data['country'] ?? 0,
            'city' => $data['city'] ?? '',
            'zip' => $data['zip'] ?? '',
            'state' => $data['state'] ?? '',
            'address' => $data['address'] ?? '',
            'website' => $data['website'] ?? '',
            'datecreated' => date('Y-m-d H:i:s'),
        ];
        
        $customer_id = $this->clients_model->add($customer_data);
        
        if ($customer_id) {
            // Tạo contact chính nếu có email
            if (!empty($data['email'])) {
                $contact_data = [
                    'userid' => $customer_id,
                    'firstname' => $data['firstname'] ?? $data['company'],
                    'lastname' => $data['lastname'] ?? '',
                    'email' => $data['email'],
                    'phonenumber' => $data['phone'] ?? '',
                    'is_primary' => 1,
                    'active' => 1,
                    'datecreated' => date('Y-m-d H:i:s'),
                ];
                $this->clients_model->add_contact($contact_data, $customer_id);
            }
            
            $this->json_response([
                'status' => true,
                'message' => 'Customer created successfully',
                'id' => $customer_id,
            ], 201);
        } else {
            $this->json_response(['error' => 'Failed to create customer'], 500);
        }
    }
    
    /**
     * Cập nhật khách hàng
     * POST /custom_api/customers/update/{id}
     */
    public function customers_update($id = null)
    {
        $this->authenticate();
        
        if (!$id) {
            $this->json_response(['error' => 'Customer ID required'], 400);
        }
        
        $data = $this->get_json_input();
        
        $update_data = [];
        $allowed_fields = ['company', 'vat', 'phonenumber', 'country', 'city', 'zip', 'state', 'address', 'website', 'active'];
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $update_data[$field] = $data[$field];
            }
        }
        
        if (empty($update_data)) {
            $this->json_response(['error' => 'No data to update'], 400);
        }
        
        $result = $this->clients_model->update($update_data, $id);
        
        $this->json_response([
            'status' => (bool)$result,
            'message' => $result ? 'Customer updated successfully' : 'No changes made',
        ]);
    }

    // ==================== PROJECTS ====================
    
    /**
     * Lấy danh sách dự án
     * GET /custom_api/projects
     */
    public function projects()
    {
        $this->authenticate();
        
        $page = $this->input->get('page') ?? 1;
        $limit = $this->input->get('limit') ?? 20;
        $clientid = $this->input->get('clientid');
        $status = $this->input->get('status');
        
        $offset = ($page - 1) * $limit;
        
        $this->db->select('p.*, c.company as client_name');
        $this->db->from('tblprojects p');
        $this->db->join('tblclients c', 'c.userid = p.clientid', 'left');
        
        if ($clientid) {
            $this->db->where('p.clientid', $clientid);
        }
        
        if ($status !== null && $status !== '') {
            $this->db->where('p.status', $status);
        }
        
        $total = $this->db->count_all_results('', false);
        
        $this->db->limit($limit, $offset);
        $this->db->order_by('p.id', 'DESC');
        $projects = $this->db->get()->result_array();
        
        $this->json_response([
            'status' => true,
            'data' => $projects,
            'total' => $total,
            'page' => (int)$page,
            'limit' => (int)$limit,
        ]);
    }
    
    /**
     * Lấy chi tiết dự án
     * GET /custom_api/project/{id}
     */
    public function project($id = null)
    {
        $this->authenticate();
        
        if (!$id) {
            $this->json_response(['error' => 'Project ID required'], 400);
        }
        
        $project = $this->projects_model->get($id);
        
        if (!$project) {
            $this->json_response(['error' => 'Project not found'], 404);
        }
        
        // Get tasks
        $this->db->where('rel_type', 'project');
        $this->db->where('rel_id', $id);
        $tasks = $this->db->get('tbltasks')->result_array();
        
        // Get members
        $members = $this->projects_model->get_project_members($id);
        
        $this->json_response([
            'status' => true,
            'data' => $project,
            'tasks' => $tasks,
            'members' => $members,
        ]);
    }
    
    /**
     * Tạo dự án mới
     * POST /custom_api/projects/create
     */
    public function projects_create()
    {
        $this->authenticate();
        
        $data = $this->get_json_input();
        
        if (empty($data['name']) || empty($data['clientid'])) {
            $this->json_response(['error' => 'Project name and client ID are required'], 400);
        }
        
        $project_data = [
            'name' => $data['name'],
            'clientid' => $data['clientid'],
            'description' => $data['description'] ?? '',
            'start_date' => $data['start_date'] ?? date('Y-m-d'),
            'deadline' => $data['deadline'] ?? null,
            'status' => $data['status'] ?? 1, // 1 = Not Started
            'progress_from_tasks' => 1,
            'billing_type' => $data['billing_type'] ?? 1,
            'project_rate_per_hour' => $data['rate'] ?? 0,
            'estimated_hours' => $data['estimated_hours'] ?? 0,
        ];
        
        $project_id = $this->projects_model->add($project_data);
        
        if ($project_id) {
            $this->json_response([
                'status' => true,
                'message' => 'Project created successfully',
                'id' => $project_id,
            ], 201);
        } else {
            $this->json_response(['error' => 'Failed to create project'], 500);
        }
    }
    
    /**
     * Cập nhật tiến độ dự án
     * POST /custom_api/projects/progress/{id}
     */
    public function projects_progress($id = null)
    {
        $this->authenticate();
        
        if (!$id) {
            $this->json_response(['error' => 'Project ID required'], 400);
        }
        
        $data = $this->get_json_input();
        $progress = isset($data['progress']) ? (int)$data['progress'] : null;
        
        if ($progress === null || $progress < 0 || $progress > 100) {
            $this->json_response(['error' => 'Progress must be between 0 and 100'], 400);
        }
        
        // Tắt auto progress from tasks
        $this->db->where('id', $id);
        $this->db->update('tblprojects', [
            'progress_from_tasks' => 0,
            'progress' => $progress,
        ]);
        
        $this->json_response([
            'status' => true,
            'message' => 'Progress updated to ' . $progress . '%',
            'progress' => $progress,
        ]);
    }

    // ==================== TASKS ====================
    
    /**
     * Lấy danh sách tasks
     * GET /custom_api/tasks
     */
    public function tasks()
    {
        $this->authenticate();
        
        $page = $this->input->get('page') ?? 1;
        $limit = $this->input->get('limit') ?? 20;
        $rel_type = $this->input->get('rel_type');
        $rel_id = $this->input->get('rel_id');
        $status = $this->input->get('status');
        
        $offset = ($page - 1) * $limit;
        
        $this->db->select('*');
        $this->db->from('tbltasks');
        
        if ($rel_type) {
            $this->db->where('rel_type', $rel_type);
        }
        
        if ($rel_id) {
            $this->db->where('rel_id', $rel_id);
        }
        
        if ($status !== null && $status !== '') {
            $this->db->where('status', $status);
        }
        
        $total = $this->db->count_all_results('', false);
        
        $this->db->limit($limit, $offset);
        $this->db->order_by('id', 'DESC');
        $tasks = $this->db->get()->result_array();
        
        $this->json_response([
            'status' => true,
            'data' => $tasks,
            'total' => $total,
            'page' => (int)$page,
            'limit' => (int)$limit,
        ]);
    }
    
    /**
     * Tạo task mới
     * POST /custom_api/tasks/create
     */
    public function tasks_create()
    {
        $this->authenticate();
        
        $data = $this->get_json_input();
        
        if (empty($data['name'])) {
            $this->json_response(['error' => 'Task name is required'], 400);
        }
        
        $task_data = [
            'name' => $data['name'],
            'description' => $data['description'] ?? '',
            'priority' => $data['priority'] ?? 2, // 1=Low, 2=Medium, 3=High, 4=Urgent
            'startdate' => $data['startdate'] ?? date('Y-m-d'),
            'duedate' => $data['duedate'] ?? null,
            'status' => $data['status'] ?? 1, // 1=Not Started
            'rel_type' => $data['rel_type'] ?? '',
            'rel_id' => $data['rel_id'] ?? 0,
            'dateadded' => date('Y-m-d H:i:s'),
            'addedfrom' => 1, // Admin user
        ];
        
        $this->db->insert('tbltasks', $task_data);
        $task_id = $this->db->insert_id();
        
        if ($task_id) {
            // Assign members nếu có
            if (!empty($data['assignees'])) {
                foreach ($data['assignees'] as $staff_id) {
                    $this->db->insert('tbltaskassignees', [
                        'taskid' => $task_id,
                        'staffid' => $staff_id,
                        'assigned_from' => 1,
                    ]);
                }
            }
            
            $this->json_response([
                'status' => true,
                'message' => 'Task created successfully',
                'id' => $task_id,
            ], 201);
        } else {
            $this->json_response(['error' => 'Failed to create task'], 500);
        }
    }
    
    /**
     * Đánh dấu task hoàn thành
     * POST /custom_api/tasks/complete/{id}
     */
    public function tasks_complete($id = null)
    {
        $this->authenticate();
        
        if (!$id) {
            $this->json_response(['error' => 'Task ID required'], 400);
        }
        
        $this->db->where('id', $id);
        $this->db->update('tbltasks', [
            'status' => 5, // 5 = Complete
            'datefinished' => date('Y-m-d H:i:s'),
        ]);
        
        $this->json_response([
            'status' => true,
            'message' => 'Task marked as complete',
        ]);
    }

    // ==================== INVOICES ====================
    
    /**
     * Lấy danh sách hóa đơn
     * GET /custom_api/invoices
     */
    public function invoices()
    {
        $this->authenticate();
        
        $page = $this->input->get('page') ?? 1;
        $limit = $this->input->get('limit') ?? 20;
        $clientid = $this->input->get('clientid');
        $status = $this->input->get('status');
        
        $offset = ($page - 1) * $limit;
        
        $this->db->select('i.*, c.company as client_name');
        $this->db->from('tblinvoices i');
        $this->db->join('tblclients c', 'c.userid = i.clientid', 'left');
        
        if ($clientid) {
            $this->db->where('i.clientid', $clientid);
        }
        
        if ($status !== null && $status !== '') {
            $this->db->where('i.status', $status);
        }
        
        $total = $this->db->count_all_results('', false);
        
        $this->db->limit($limit, $offset);
        $this->db->order_by('i.id', 'DESC');
        $invoices = $this->db->get()->result_array();
        
        $this->json_response([
            'status' => true,
            'data' => $invoices,
            'total' => $total,
            'page' => (int)$page,
            'limit' => (int)$limit,
        ]);
    }

    // ==================== LEADS ====================
    
    /**
     * Lấy danh sách leads
     * GET /custom_api/leads
     */
    public function leads()
    {
        $this->authenticate();
        
        $page = $this->input->get('page') ?? 1;
        $limit = $this->input->get('limit') ?? 20;
        $status = $this->input->get('status');
        
        $offset = ($page - 1) * $limit;
        
        $this->db->select('*');
        $this->db->from('tblleads');
        
        if ($status !== null && $status !== '') {
            $this->db->where('status', $status);
        }
        
        $total = $this->db->count_all_results('', false);
        
        $this->db->limit($limit, $offset);
        $this->db->order_by('id', 'DESC');
        $leads = $this->db->get()->result_array();
        
        $this->json_response([
            'status' => true,
            'data' => $leads,
            'total' => $total,
            'page' => (int)$page,
            'limit' => (int)$limit,
        ]);
    }
    
    /**
     * Tạo lead mới
     * POST /custom_api/leads/create
     */
    public function leads_create()
    {
        $this->authenticate();
        
        $data = $this->get_json_input();
        
        if (empty($data['name']) && empty($data['email'])) {
            $this->json_response(['error' => 'Lead name or email is required'], 400);
        }
        
        $lead_data = [
            'name' => $data['name'] ?? '',
            'email' => $data['email'] ?? '',
            'phonenumber' => $data['phone'] ?? '',
            'company' => $data['company'] ?? '',
            'address' => $data['address'] ?? '',
            'city' => $data['city'] ?? '',
            'state' => $data['state'] ?? '',
            'country' => $data['country'] ?? 0,
            'description' => $data['description'] ?? '',
            'status' => $data['status'] ?? 1,
            'source' => $data['source'] ?? 0,
            'assigned' => $data['assigned'] ?? 0,
            'dateadded' => date('Y-m-d H:i:s'),
            'addedfrom' => 1,
        ];
        
        $this->db->insert('tblleads', $lead_data);
        $lead_id = $this->db->insert_id();
        
        if ($lead_id) {
            $this->json_response([
                'status' => true,
                'message' => 'Lead created successfully',
                'id' => $lead_id,
            ], 201);
        } else {
            $this->json_response(['error' => 'Failed to create lead'], 500);
        }
    }

    // ==================== ESTIMATES ====================
    
    /**
     * Lấy danh sách báo giá
     * GET /custom_api/estimates
     */
    public function estimates()
    {
        $this->authenticate();
        
        $page = $this->input->get('page') ?? 1;
        $limit = $this->input->get('limit') ?? 20;
        $clientid = $this->input->get('clientid');
        $status = $this->input->get('status');
        
        $offset = ($page - 1) * $limit;
        
        $this->db->select('e.*, c.company as client_name');
        $this->db->from('tblestimates e');
        $this->db->join('tblclients c', 'c.userid = e.clientid', 'left');
        
        if ($clientid) {
            $this->db->where('e.clientid', $clientid);
        }
        
        if ($status !== null && $status !== '') {
            $this->db->where('e.status', $status);
        }
        
        $total = $this->db->count_all_results('', false);
        
        $this->db->limit($limit, $offset);
        $this->db->order_by('e.id', 'DESC');
        $estimates = $this->db->get()->result_array();
        
        $this->json_response([
            'status' => true,
            'data' => $estimates,
            'total' => $total,
            'page' => (int)$page,
            'limit' => (int)$limit,
        ]);
    }

    // ==================== STAFF ====================
    
    /**
     * Lấy danh sách nhân viên
     * GET /custom_api/staff
     */
    public function staff()
    {
        $this->authenticate();
        
        $this->db->select('staffid, email, firstname, lastname, phonenumber, active, last_login, profile_image');
        $staff = $this->db->get('tblstaff')->result_array();
        
        $this->json_response([
            'status' => true,
            'data' => $staff,
        ]);
    }

    // ==================== SYNC FROM APP ====================
    
    /**
     * Sync user từ app sang Perfex customer
     * POST /custom_api/sync/user
     */
    public function sync_user()
    {
        $this->authenticate();
        
        $data = $this->get_json_input();
        
        if (empty($data['email'])) {
            $this->json_response(['error' => 'Email is required'], 400);
        }
        
        // Kiểm tra customer đã tồn tại chưa (by email)
        $this->db->select('userid');
        $this->db->where('email', $data['email']);
        $existing = $this->db->get('tblcontacts')->row();
        
        if ($existing) {
            // Update existing
            $this->json_response([
                'status' => true,
                'message' => 'Customer already exists',
                'action' => 'existing',
                'customer_id' => $existing->userid,
            ]);
        } else {
            // Create new customer
            $customer_data = [
                'company' => $data['name'] ?? $data['email'],
                'phonenumber' => $data['phone'] ?? '',
                'address' => $data['address'] ?? '',
                'datecreated' => date('Y-m-d H:i:s'),
            ];
            
            $customer_id = $this->clients_model->add($customer_data);
            
            if ($customer_id) {
                // Add contact
                $contact_data = [
                    'userid' => $customer_id,
                    'firstname' => $data['name'] ?? '',
                    'lastname' => '',
                    'email' => $data['email'],
                    'phonenumber' => $data['phone'] ?? '',
                    'is_primary' => 1,
                    'active' => 1,
                    'datecreated' => date('Y-m-d H:i:s'),
                ];
                $this->clients_model->add_contact($contact_data, $customer_id);
                
                $this->json_response([
                    'status' => true,
                    'message' => 'Customer created from app user',
                    'action' => 'created',
                    'customer_id' => $customer_id,
                ], 201);
            } else {
                $this->json_response(['error' => 'Failed to create customer'], 500);
            }
        }
    }
    
    /**
     * Sync project từ app sang Perfex
     * POST /custom_api/sync/project
     */
    public function sync_project()
    {
        $this->authenticate();
        
        $data = $this->get_json_input();
        
        if (empty($data['name']) || empty($data['clientid'])) {
            $this->json_response(['error' => 'Project name and client ID are required'], 400);
        }
        
        // Kiểm tra project tồn tại (by external_id if provided)
        if (!empty($data['external_id'])) {
            $this->db->where('external_id', $data['external_id']);
            $existing = $this->db->get('tblprojects')->row();
            
            if ($existing) {
                // Update existing
                $update_data = [
                    'name' => $data['name'],
                    'description' => $data['description'] ?? $existing->description,
                    'status' => $data['status'] ?? $existing->status,
                ];
                
                if (isset($data['progress'])) {
                    $update_data['progress_from_tasks'] = 0;
                    $update_data['progress'] = (int)$data['progress'];
                }
                
                $this->db->where('id', $existing->id);
                $this->db->update('tblprojects', $update_data);
                
                $this->json_response([
                    'status' => true,
                    'message' => 'Project updated',
                    'action' => 'updated',
                    'project_id' => $existing->id,
                ]);
            }
        }
        
        // Create new project
        $project_data = [
            'name' => $data['name'],
            'clientid' => $data['clientid'],
            'description' => $data['description'] ?? '',
            'start_date' => $data['start_date'] ?? date('Y-m-d'),
            'deadline' => $data['deadline'] ?? null,
            'status' => $data['status'] ?? 1,
            'progress_from_tasks' => isset($data['progress']) ? 0 : 1,
            'progress' => $data['progress'] ?? 0,
            'billing_type' => 1,
            'external_id' => $data['external_id'] ?? null,
        ];
        
        $project_id = $this->projects_model->add($project_data);
        
        if ($project_id) {
            $this->json_response([
                'status' => true,
                'message' => 'Project created',
                'action' => 'created',
                'project_id' => $project_id,
            ], 201);
        } else {
            $this->json_response(['error' => 'Failed to create project'], 500);
        }
    }

    // ==================== AUTHENTICATION ENDPOINTS ====================
    
    /**
     * Đăng ký tài khoản khách hàng mới
     * POST /custom_api/auth/register
     * 
     * Body: {
     *   "email": "customer@example.com",
     *   "password": "123456",
     *   "firstname": "Nguyen",
     *   "lastname": "Van A",
     *   "phone": "0901234567",
     *   "company": "Công ty ABC" (optional, default = firstname + lastname)
     * }
     */
    public function auth_register()
    {
        $this->authenticate();
        
        $data = $this->get_json_input();
        
        // Validate required fields
        if (empty($data['email']) || empty($data['password']) || empty($data['firstname'])) {
            $this->json_response([
                'status' => false,
                'error' => 'Email, password và firstname là bắt buộc'
            ], 400);
        }
        
        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->json_response([
                'status' => false,
                'error' => 'Email không hợp lệ'
            ], 400);
        }
        
        // Check if email already exists in contacts
        $this->db->where('email', $data['email']);
        $existing_contact = $this->db->get('tblcontacts')->row();
        
        if ($existing_contact) {
            $this->json_response([
                'status' => false,
                'error' => 'Email này đã được đăng ký',
                'code' => 'EMAIL_EXISTS'
            ], 409);
        }
        
        // Check if email exists in staff
        $this->db->where('email', $data['email']);
        $existing_staff = $this->db->get('tblstaff')->row();
        
        if ($existing_staff) {
            $this->json_response([
                'status' => false,
                'error' => 'Email này đã được sử dụng bởi nhân viên',
                'code' => 'EMAIL_EXISTS_STAFF'
            ], 409);
        }
        
        // Create customer (client) first
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
        ];
        
        $customer_id = $this->clients_model->add($customer_data);
        
        if (!$customer_id) {
            $this->json_response([
                'status' => false,
                'error' => 'Không thể tạo tài khoản khách hàng'
            ], 500);
        }
        
        // Hash password using Perfex's built-in function
        $this->load->helper('phpass');
        $hasher = new PasswordHash(8, TRUE);
        $hashed_password = $hasher->HashPassword($data['password']);
        
        // Create contact for login
        $contact_data = [
            'userid' => $customer_id,
            'firstname' => $data['firstname'],
            'lastname' => $data['lastname'] ?? '',
            'email' => $data['email'],
            'phonenumber' => $data['phone'] ?? '',
            'title' => $data['title'] ?? '',
            'password' => $hashed_password,
            'is_primary' => 1,
            'active' => 1,
            'datecreated' => date('Y-m-d H:i:s'),
            'email_verified_at' => date('Y-m-d H:i:s'), // Auto verify
        ];
        
        $contact_id = $this->clients_model->add_contact($contact_data, $customer_id);
        
        if (!$contact_id) {
            // Rollback - delete customer
            $this->clients_model->delete($customer_id);
            $this->json_response([
                'status' => false,
                'error' => 'Không thể tạo thông tin đăng nhập'
            ], 500);
        }
        
        // Get the created contact
        $contact = $this->db->where('id', $contact_id)->get('tblcontacts')->row();
        
        $this->json_response([
            'status' => true,
            'message' => 'Đăng ký thành công',
            'user' => [
                'id' => $contact_id,
                'customer_id' => $customer_id,
                'email' => $contact->email,
                'firstname' => $contact->firstname,
                'lastname' => $contact->lastname,
                'phone' => $contact->phonenumber,
                'company' => $company_name,
                'is_staff' => false,
                'role' => 'customer',
            ]
        ], 201);
    }
    
    /**
     * Đăng nhập (hỗ trợ cả Customer Contact và Staff)
     * POST /custom_api/auth/login
     * 
     * Body: {
     *   "email": "user@example.com",
     *   "password": "123456"
     * }
     */
    public function auth_login()
    {
        $this->authenticate();
        
        $data = $this->get_json_input();
        
        if (empty($data['email']) || empty($data['password'])) {
            $this->json_response([
                'status' => false,
                'error' => 'Email và password là bắt buộc'
            ], 400);
        }
        
        $email = strtolower(trim($data['email']));
        $password = $data['password'];
        
        // Load password helper
        $this->load->helper('phpass');
        $hasher = new PasswordHash(8, TRUE);
        
        // 1. Try Staff login first
        $this->db->where('email', $email);
        $this->db->where('active', 1);
        $staff = $this->db->get('tblstaff')->row();
        
        if ($staff && $hasher->CheckPassword($password, $staff->password)) {
            // Staff login success
            // Update last login
            $this->db->where('staffid', $staff->staffid);
            $this->db->update('tblstaff', [
                'last_login' => date('Y-m-d H:i:s'),
                'last_ip' => $this->input->ip_address(),
            ]);
            
            $this->json_response([
                'status' => true,
                'message' => 'Đăng nhập thành công',
                'user' => [
                    'id' => $staff->staffid,
                    'staff_id' => $staff->staffid,
                    'customer_id' => null,
                    'contact_id' => null,
                    'email' => $staff->email,
                    'firstname' => $staff->firstname,
                    'lastname' => $staff->lastname,
                    'phone' => $staff->phonenumber,
                    'profile_image' => $staff->profile_image,
                    'is_staff' => true,
                    'is_admin' => $staff->admin == 1,
                    'role' => $staff->admin == 1 ? 'admin' : 'staff',
                ]
            ]);
        }
        
        // 2. Try Contact (Customer) login
        $this->db->select('c.*, cl.company, cl.userid as customer_id');
        $this->db->from('tblcontacts c');
        $this->db->join('tblclients cl', 'cl.userid = c.userid', 'left');
        $this->db->where('c.email', $email);
        $this->db->where('c.active', 1);
        $contact = $this->db->get()->row();
        
        if ($contact && !empty($contact->password) && $hasher->CheckPassword($password, $contact->password)) {
            // Contact login success
            // Update last login
            $this->db->where('id', $contact->id);
            $this->db->update('tblcontacts', [
                'last_login' => date('Y-m-d H:i:s'),
                'last_ip' => $this->input->ip_address(),
            ]);
            
            $this->json_response([
                'status' => true,
                'message' => 'Đăng nhập thành công',
                'user' => [
                    'id' => $contact->id,
                    'staff_id' => null,
                    'customer_id' => $contact->customer_id,
                    'contact_id' => $contact->id,
                    'email' => $contact->email,
                    'firstname' => $contact->firstname,
                    'lastname' => $contact->lastname,
                    'phone' => $contact->phonenumber,
                    'company' => $contact->company,
                    'profile_image' => $contact->profile_image,
                    'is_staff' => false,
                    'is_admin' => false,
                    'role' => 'customer',
                ]
            ]);
        }
        
        // Login failed
        $this->json_response([
            'status' => false,
            'error' => 'Email hoặc mật khẩu không đúng',
            'code' => 'INVALID_CREDENTIALS'
        ], 401);
    }
    
    /**
     * Lấy thông tin user đang đăng nhập
     * POST /custom_api/auth/me
     * 
     * Body: {
     *   "user_type": "contact" or "staff",
     *   "user_id": 123
     * }
     */
    public function auth_me()
    {
        $this->authenticate();
        
        $data = $this->get_json_input();
        
        if (empty($data['user_type']) || empty($data['user_id'])) {
            $this->json_response([
                'status' => false,
                'error' => 'user_type và user_id là bắt buộc'
            ], 400);
        }
        
        if ($data['user_type'] === 'staff') {
            $this->db->where('staffid', $data['user_id']);
            $this->db->where('active', 1);
            $staff = $this->db->get('tblstaff')->row();
            
            if (!$staff) {
                $this->json_response([
                    'status' => false,
                    'error' => 'Không tìm thấy tài khoản'
                ], 404);
            }
            
            $this->json_response([
                'status' => true,
                'user' => [
                    'id' => $staff->staffid,
                    'staff_id' => $staff->staffid,
                    'customer_id' => null,
                    'contact_id' => null,
                    'email' => $staff->email,
                    'firstname' => $staff->firstname,
                    'lastname' => $staff->lastname,
                    'phone' => $staff->phonenumber,
                    'profile_image' => $staff->profile_image,
                    'is_staff' => true,
                    'is_admin' => $staff->admin == 1,
                    'role' => $staff->admin == 1 ? 'admin' : 'staff',
                ]
            ]);
        } else {
            // Contact
            $this->db->select('c.*, cl.company, cl.userid as customer_id');
            $this->db->from('tblcontacts c');
            $this->db->join('tblclients cl', 'cl.userid = c.userid', 'left');
            $this->db->where('c.id', $data['user_id']);
            $this->db->where('c.active', 1);
            $contact = $this->db->get()->row();
            
            if (!$contact) {
                $this->json_response([
                    'status' => false,
                    'error' => 'Không tìm thấy tài khoản'
                ], 404);
            }
            
            $this->json_response([
                'status' => true,
                'user' => [
                    'id' => $contact->id,
                    'staff_id' => null,
                    'customer_id' => $contact->customer_id,
                    'contact_id' => $contact->id,
                    'email' => $contact->email,
                    'firstname' => $contact->firstname,
                    'lastname' => $contact->lastname,
                    'phone' => $contact->phonenumber,
                    'company' => $contact->company,
                    'profile_image' => $contact->profile_image,
                    'is_staff' => false,
                    'is_admin' => false,
                    'role' => 'customer',
                ]
            ]);
        }
    }
    
    /**
     * Đổi mật khẩu
     * POST /custom_api/auth/change_password
     * 
     * Body: {
     *   "user_type": "contact" or "staff",
     *   "user_id": 123,
     *   "old_password": "old123",
     *   "new_password": "new456"
     * }
     */
    public function auth_change_password()
    {
        $this->authenticate();
        
        $data = $this->get_json_input();
        
        if (empty($data['user_type']) || empty($data['user_id']) || 
            empty($data['old_password']) || empty($data['new_password'])) {
            $this->json_response([
                'status' => false,
                'error' => 'Thiếu thông tin bắt buộc'
            ], 400);
        }
        
        if (strlen($data['new_password']) < 6) {
            $this->json_response([
                'status' => false,
                'error' => 'Mật khẩu mới phải có ít nhất 6 ký tự'
            ], 400);
        }
        
        $this->load->helper('phpass');
        $hasher = new PasswordHash(8, TRUE);
        
        if ($data['user_type'] === 'staff') {
            $this->db->where('staffid', $data['user_id']);
            $user = $this->db->get('tblstaff')->row();
            
            if (!$user || !$hasher->CheckPassword($data['old_password'], $user->password)) {
                $this->json_response([
                    'status' => false,
                    'error' => 'Mật khẩu cũ không đúng'
                ], 401);
            }
            
            $new_hash = $hasher->HashPassword($data['new_password']);
            $this->db->where('staffid', $data['user_id']);
            $this->db->update('tblstaff', ['password' => $new_hash]);
        } else {
            $this->db->where('id', $data['user_id']);
            $user = $this->db->get('tblcontacts')->row();
            
            if (!$user || !$hasher->CheckPassword($data['old_password'], $user->password)) {
                $this->json_response([
                    'status' => false,
                    'error' => 'Mật khẩu cũ không đúng'
                ], 401);
            }
            
            $new_hash = $hasher->HashPassword($data['new_password']);
            $this->db->where('id', $data['user_id']);
            $this->db->update('tblcontacts', ['password' => $new_hash]);
        }
        
        $this->json_response([
            'status' => true,
            'message' => 'Đổi mật khẩu thành công'
        ]);
    }
    
    /**
     * Cập nhật thông tin profile
     * POST /custom_api/auth/update_profile
     * 
     * Body: {
     *   "user_type": "contact" or "staff",
     *   "user_id": 123,
     *   "firstname": "Nguyen",
     *   "lastname": "Van A",
     *   "phone": "0901234567"
     * }
     */
    public function auth_update_profile()
    {
        $this->authenticate();
        
        $data = $this->get_json_input();
        
        if (empty($data['user_type']) || empty($data['user_id'])) {
            $this->json_response([
                'status' => false,
                'error' => 'user_type và user_id là bắt buộc'
            ], 400);
        }
        
        $update_data = [];
        $allowed_fields = ['firstname', 'lastname', 'phonenumber', 'title'];
        
        foreach ($allowed_fields as $field) {
            $input_field = $field === 'phonenumber' ? 'phone' : $field;
            if (isset($data[$input_field])) {
                $update_data[$field] = $data[$input_field];
            }
        }
        
        if (empty($update_data)) {
            $this->json_response([
                'status' => false,
                'error' => 'Không có dữ liệu để cập nhật'
            ], 400);
        }
        
        if ($data['user_type'] === 'staff') {
            $this->db->where('staffid', $data['user_id']);
            $result = $this->db->update('tblstaff', $update_data);
        } else {
            $this->db->where('id', $data['user_id']);
            $result = $this->db->update('tblcontacts', $update_data);
            
            // Also update customer company name if firstname/lastname changed
            if (isset($data['firstname']) || isset($data['lastname'])) {
                $contact = $this->db->where('id', $data['user_id'])->get('tblcontacts')->row();
                if ($contact && $contact->is_primary == 1) {
                    $new_company = trim($contact->firstname . ' ' . $contact->lastname);
                    $this->db->where('userid', $contact->userid);
                    $this->db->update('tblclients', ['company' => $new_company]);
                }
            }
        }
        
        $this->json_response([
            'status' => true,
            'message' => 'Cập nhật thông tin thành công'
        ]);
    }
}

