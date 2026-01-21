<?php
/**
 * Mobile API Routes Initialization
 * This file is auto-loaded by Perfex to register API routes
 */

defined('BASEPATH') or exit('No direct script access allowed');

// API v1 Routes - These will be merged with main routes
$route['api/v1/auth/login'] = 'mobile_api/api/auth_login';
$route['api/v1/auth/register'] = 'mobile_api/api/auth_register';
$route['api/v1/auth/me'] = 'mobile_api/api/auth_me';
$route['api/v1/auth/change-password'] = 'mobile_api/api/auth_change_password';

$route['api/v1/projects'] = 'mobile_api/api/projects';
$route['api/v1/projects/(:num)'] = 'mobile_api/api/projects/$1';
$route['api/v1/projects/(:num)/tasks'] = 'mobile_api/api/project_tasks/$1';

$route['api/v1/invoices'] = 'mobile_api/api/invoices';
$route['api/v1/invoices/(:num)'] = 'mobile_api/api/invoices/$1';

$route['api/v1/estimates'] = 'mobile_api/api/estimates';
$route['api/v1/estimates/(:num)'] = 'mobile_api/api/estimates/$1';

$route['api/v1/tasks'] = 'mobile_api/api/tasks';
$route['api/v1/tasks/(:num)'] = 'mobile_api/api/tasks/$1';

$route['api/v1/tickets'] = 'mobile_api/api/tickets';
$route['api/v1/tickets/(:num)'] = 'mobile_api/api/tickets/$1';
$route['api/v1/tickets/create'] = 'mobile_api/api/tickets_create';

$route['api/v1/customers'] = 'mobile_api/api/customers';
$route['api/v1/customers/(:num)'] = 'mobile_api/api/customers/$1';

$route['api/v1/dashboard'] = 'mobile_api/api/dashboard';

$route['api/v1/knowledge-base'] = 'mobile_api/api/knowledge_base';
$route['api/v1/knowledge-base/(:any)'] = 'mobile_api/api/knowledge_base/$1';
