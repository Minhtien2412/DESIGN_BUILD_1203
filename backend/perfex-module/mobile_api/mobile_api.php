<?php
/**
 * Module Name: Mobile API
 * Description: REST API cho ứng dụng mobile ThietKeResort
 * Version: 1.0.0
 * Requires at least: 3.0.*
 * Author: ThietKeResort Team
 * Author URI: https://thietkeresort.com.vn
 */

defined('BASEPATH') or exit('No direct script access allowed');

/*
Module Name: Mobile API
Description: REST API endpoints cho ứng dụng mobile - Hỗ trợ đăng nhập, đăng ký, quản lý khách hàng, dự án, hóa đơn
Version: 1.0.0
Requires at least: 3.0.*
*/

// Define module constants
define('MOBILE_API_MODULE_NAME', 'mobile_api');
define('MOBILE_API_VERSION', '1.0.0');

// Module hooks
hooks()->add_action('admin_init', 'mobile_api_module_init_menu_items');
hooks()->add_action('app_admin_footer', 'mobile_api_module_add_footer_js');

/**
 * Register module activation hook
 */
register_activation_hook(MOBILE_API_MODULE_NAME, 'mobile_api_module_activation_hook');

function mobile_api_module_activation_hook()
{
    $CI = &get_instance();
    
    // Create API keys table
    $CI->db->query("
        CREATE TABLE IF NOT EXISTS `" . db_prefix() . "mobile_api_keys` (
            `id` INT(11) NOT NULL AUTO_INCREMENT,
            `name` VARCHAR(255) NOT NULL,
            `api_key` VARCHAR(255) NOT NULL,
            `active` TINYINT(1) NOT NULL DEFAULT 1,
            `created_at` DATETIME NOT NULL,
            `last_used` DATETIME NULL,
            `allowed_ips` TEXT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `api_key` (`api_key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    ");
    
    // Create API logs table
    $CI->db->query("
        CREATE TABLE IF NOT EXISTS `" . db_prefix() . "mobile_api_logs` (
            `id` INT(11) NOT NULL AUTO_INCREMENT,
            `api_key_id` INT(11) NULL,
            `endpoint` VARCHAR(255) NOT NULL,
            `method` VARCHAR(10) NOT NULL,
            `ip_address` VARCHAR(45) NOT NULL,
            `user_agent` TEXT NULL,
            `request_data` TEXT NULL,
            `response_code` INT(11) NOT NULL,
            `created_at` DATETIME NOT NULL,
            PRIMARY KEY (`id`),
            KEY `api_key_id` (`api_key_id`),
            KEY `created_at` (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    ");
    
    // Generate default API key
    $default_key = bin2hex(random_bytes(32));
    $CI->db->insert(db_prefix() . 'mobile_api_keys', [
        'name' => 'Default Mobile App Key',
        'api_key' => $default_key,
        'active' => 1,
        'created_at' => date('Y-m-d H:i:s'),
    ]);
    
    // Add options
    add_option('mobile_api_enabled', '1');
    add_option('mobile_api_rate_limit', '100'); // requests per minute
    add_option('mobile_api_log_requests', '1');
    add_option('mobile_api_allow_registration', '1');
}

/**
 * Register module deactivation hook
 */
register_deactivation_hook(MOBILE_API_MODULE_NAME, 'mobile_api_module_deactivation_hook');

function mobile_api_module_deactivation_hook()
{
    // Optionally clean up (keep tables for data preservation)
}

/**
 * Init menu items in admin
 */
function mobile_api_module_init_menu_items()
{
    $CI = &get_instance();
    
    if (has_permission('settings', '', 'view')) {
        $CI->app_menu->add_sidebar_menu_item('mobile-api', [
            'name'     => 'Mobile API',
            'icon'     => 'fa fa-mobile',
            'position' => 50,
        ]);
        
        $CI->app_menu->add_sidebar_children_item('mobile-api', [
            'slug'     => 'mobile-api-settings',
            'name'     => 'Cài đặt',
            'href'     => admin_url('mobile_api/settings'),
            'position' => 1,
        ]);
        
        $CI->app_menu->add_sidebar_children_item('mobile-api', [
            'slug'     => 'mobile-api-keys',
            'name'     => 'API Keys',
            'href'     => admin_url('mobile_api/api_keys'),
            'position' => 2,
        ]);
        
        $CI->app_menu->add_sidebar_children_item('mobile-api', [
            'slug'     => 'mobile-api-logs',
            'name'     => 'Logs',
            'href'     => admin_url('mobile_api/logs'),
            'position' => 3,
        ]);
        
        $CI->app_menu->add_sidebar_children_item('mobile-api', [
            'slug'     => 'mobile-api-docs',
            'name'     => 'Tài liệu API',
            'href'     => admin_url('mobile_api/docs'),
            'position' => 4,
        ]);
    }
}

/**
 * Add footer JS
 */
function mobile_api_module_add_footer_js()
{
    // Add any required JS
}

/**
 * Register language files
 */
register_language_files(MOBILE_API_MODULE_NAME, [MOBILE_API_MODULE_NAME]);
