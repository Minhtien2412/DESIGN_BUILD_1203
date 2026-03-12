<?php
/**
 * Mobile API Model
 */

defined('BASEPATH') or exit('No direct script access allowed');

class Mobile_api_model extends App_Model
{
    public function __construct()
    {
        parent::__construct();
    }
    
    /**
     * Get API key by key string
     */
    public function get_api_key($key)
    {
        return $this->db
            ->where('api_key', $key)
            ->where('active', 1)
            ->get(db_prefix() . 'mobile_api_keys')
            ->row();
    }
    
    /**
     * Get all API keys
     */
    public function get_all_api_keys()
    {
        return $this->db->get(db_prefix() . 'mobile_api_keys')->result();
    }
    
    /**
     * Create API key
     */
    public function create_api_key($name)
    {
        $api_key = bin2hex(random_bytes(32));
        
        $this->db->insert(db_prefix() . 'mobile_api_keys', [
            'name' => $name,
            'api_key' => $api_key,
            'active' => 1,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
        
        return $api_key;
    }
    
    /**
     * Toggle API key status
     */
    public function toggle_api_key($id)
    {
        $key = $this->db->where('id', $id)->get(db_prefix() . 'mobile_api_keys')->row();
        
        if ($key) {
            $this->db->where('id', $id)->update(db_prefix() . 'mobile_api_keys', [
                'active' => $key->active ? 0 : 1,
            ]);
            return true;
        }
        
        return false;
    }
    
    /**
     * Delete API key
     */
    public function delete_api_key($id)
    {
        return $this->db->where('id', $id)->delete(db_prefix() . 'mobile_api_keys');
    }
    
    /**
     * Log API request
     */
    public function log_request($data)
    {
        return $this->db->insert(db_prefix() . 'mobile_api_logs', [
            'api_key_id' => $data['api_key_id'] ?? null,
            'endpoint' => $data['endpoint'],
            'method' => $data['method'],
            'ip_address' => $data['ip_address'],
            'user_agent' => $data['user_agent'] ?? null,
            'request_data' => $data['request_data'] ?? null,
            'response_code' => $data['response_code'],
            'created_at' => date('Y-m-d H:i:s'),
        ]);
    }
    
    /**
     * Get logs with pagination
     */
    public function get_logs($page = 1, $limit = 50)
    {
        $offset = ($page - 1) * $limit;
        
        return $this->db
            ->order_by('created_at', 'DESC')
            ->limit($limit, $offset)
            ->get(db_prefix() . 'mobile_api_logs')
            ->result();
    }
    
    /**
     * Clear all logs
     */
    public function clear_logs()
    {
        return $this->db->truncate(db_prefix() . 'mobile_api_logs');
    }
    
    /**
     * Get stats
     */
    public function get_stats()
    {
        $stats = [];
        
        $stats['total_requests'] = $this->db->count_all(db_prefix() . 'mobile_api_logs');
        $stats['total_keys'] = $this->db->count_all(db_prefix() . 'mobile_api_keys');
        $stats['active_keys'] = $this->db->where('active', 1)->from(db_prefix() . 'mobile_api_keys')->count_all_results();
        
        // Requests today
        $stats['requests_today'] = $this->db
            ->where('DATE(created_at)', date('Y-m-d'))
            ->from(db_prefix() . 'mobile_api_logs')
            ->count_all_results();
        
        return $stats;
    }
}
