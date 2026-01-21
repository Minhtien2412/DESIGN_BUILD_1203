<?php
/**
 * Mobile API - Main Controller (Admin)
 * Quản lý cài đặt, API keys và logs
 */

defined('BASEPATH') or exit('No direct script access allowed');

class Mobile_api extends AdminController
{
    public function __construct()
    {
        parent::__construct();
        
        if (!has_permission('settings', '', 'view')) {
            access_denied('Mobile API');
        }
        
        $this->load->model('mobile_api/mobile_api_model');
    }
    
    /**
     * Settings page
     */
    public function settings()
    {
        if ($this->input->post()) {
            $data = $this->input->post();
            
            update_option('mobile_api_enabled', isset($data['mobile_api_enabled']) ? '1' : '0');
            update_option('mobile_api_rate_limit', $data['mobile_api_rate_limit']);
            update_option('mobile_api_log_requests', isset($data['mobile_api_log_requests']) ? '1' : '0');
            update_option('mobile_api_allow_registration', isset($data['mobile_api_allow_registration']) ? '1' : '0');
            
            set_alert('success', 'Cài đặt đã được lưu');
            redirect(admin_url('mobile_api/settings'));
        }
        
        $data['title'] = 'Mobile API - Cài đặt';
        $data['settings'] = [
            'enabled' => get_option('mobile_api_enabled'),
            'rate_limit' => get_option('mobile_api_rate_limit'),
            'log_requests' => get_option('mobile_api_log_requests'),
            'allow_registration' => get_option('mobile_api_allow_registration'),
        ];
        
        $this->load->view('mobile_api/settings', $data);
    }
    
    /**
     * API Keys management
     */
    public function api_keys()
    {
        if ($this->input->post()) {
            $action = $this->input->post('action');
            
            if ($action === 'create') {
                $name = $this->input->post('name');
                $api_key = bin2hex(random_bytes(32));
                
                $this->db->insert(db_prefix() . 'mobile_api_keys', [
                    'name' => $name,
                    'api_key' => $api_key,
                    'active' => 1,
                    'created_at' => date('Y-m-d H:i:s'),
                ]);
                
                set_alert('success', 'API Key đã được tạo: ' . $api_key);
            } elseif ($action === 'toggle') {
                $id = $this->input->post('id');
                $key = $this->db->where('id', $id)->get(db_prefix() . 'mobile_api_keys')->row();
                
                if ($key) {
                    $this->db->where('id', $id)->update(db_prefix() . 'mobile_api_keys', [
                        'active' => $key->active ? 0 : 1,
                    ]);
                    set_alert('success', 'Đã cập nhật trạng thái API Key');
                }
            } elseif ($action === 'delete') {
                $id = $this->input->post('id');
                $this->db->where('id', $id)->delete(db_prefix() . 'mobile_api_keys');
                set_alert('success', 'Đã xóa API Key');
            }
            
            redirect(admin_url('mobile_api/api_keys'));
        }
        
        $data['title'] = 'Mobile API - API Keys';
        $data['api_keys'] = $this->db->get(db_prefix() . 'mobile_api_keys')->result();
        
        $this->load->view('mobile_api/api_keys', $data);
    }
    
    /**
     * API Logs
     */
    public function logs()
    {
        $page = $this->input->get('page') ?: 1;
        $limit = 50;
        $offset = ($page - 1) * $limit;
        
        $data['title'] = 'Mobile API - Logs';
        $data['logs'] = $this->db
            ->order_by('created_at', 'DESC')
            ->limit($limit, $offset)
            ->get(db_prefix() . 'mobile_api_logs')
            ->result();
        
        $data['total'] = $this->db->count_all(db_prefix() . 'mobile_api_logs');
        $data['page'] = $page;
        $data['limit'] = $limit;
        
        $this->load->view('mobile_api/logs', $data);
    }
    
    /**
     * Clear logs
     */
    public function clear_logs()
    {
        $this->db->truncate(db_prefix() . 'mobile_api_logs');
        set_alert('success', 'Đã xóa tất cả logs');
        redirect(admin_url('mobile_api/logs'));
    }
    
    /**
     * API Documentation
     */
    public function docs()
    {
        $data['title'] = 'Mobile API - Tài liệu';
        $data['base_url'] = site_url('api/v1');
        
        // Get first active API key for examples
        $key = $this->db->where('active', 1)->get(db_prefix() . 'mobile_api_keys')->row();
        $data['example_key'] = $key ? $key->api_key : 'YOUR_API_KEY';
        
        $this->load->view('mobile_api/docs', $data);
    }
}
