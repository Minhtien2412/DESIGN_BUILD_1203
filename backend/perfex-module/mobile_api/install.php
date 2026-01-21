<?php
/**
 * Install file for Mobile API Module
 * Run when module is activated
 */

defined('BASEPATH') or exit('No direct script access allowed');

$CI = &get_instance();

// Create API keys table
if (!$CI->db->table_exists(db_prefix() . 'mobile_api_keys')) {
    $CI->db->query("
        CREATE TABLE `" . db_prefix() . "mobile_api_keys` (
            `id` INT(11) NOT NULL AUTO_INCREMENT,
            `name` VARCHAR(255) NOT NULL,
            `api_key` VARCHAR(255) NOT NULL,
            `active` TINYINT(1) NOT NULL DEFAULT 1,
            `created_at` DATETIME NOT NULL,
            `last_used` DATETIME NULL,
            `allowed_ips` TEXT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `api_key` (`api_key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=" . $CI->db->char_set . ";
    ");
}

// Create API logs table
if (!$CI->db->table_exists(db_prefix() . 'mobile_api_logs')) {
    $CI->db->query("
        CREATE TABLE `" . db_prefix() . "mobile_api_logs` (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=" . $CI->db->char_set . ";
    ");
}

// Generate default API key if none exists
$existing = $CI->db->get(db_prefix() . 'mobile_api_keys')->num_rows();
if ($existing == 0) {
    $default_key = bin2hex(random_bytes(32));
    $CI->db->insert(db_prefix() . 'mobile_api_keys', [
        'name' => 'Default Mobile App Key',
        'api_key' => $default_key,
        'active' => 1,
        'created_at' => date('Y-m-d H:i:s'),
    ]);
}

// Add default options
add_option('mobile_api_enabled', '1');
add_option('mobile_api_rate_limit', '100');
add_option('mobile_api_log_requests', '1');
add_option('mobile_api_allow_registration', '1');
