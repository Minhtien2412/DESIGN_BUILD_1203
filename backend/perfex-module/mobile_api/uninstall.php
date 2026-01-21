<?php
/**
 * Uninstall file for Mobile API Module
 */

defined('BASEPATH') or exit('No direct script access allowed');

$CI = &get_instance();

// Drop tables (optional - uncomment if you want to remove data on uninstall)
// $CI->db->query("DROP TABLE IF EXISTS `" . db_prefix() . "mobile_api_keys`");
// $CI->db->query("DROP TABLE IF EXISTS `" . db_prefix() . "mobile_api_logs`");

// Remove options
delete_option('mobile_api_enabled');
delete_option('mobile_api_rate_limit');
delete_option('mobile_api_log_requests');
delete_option('mobile_api_allow_registration');
