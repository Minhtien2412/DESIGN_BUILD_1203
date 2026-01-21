import { ArchitectureStyle, CodeTemplate, ConsultingTopic } from '../types';

export const ARCHITECTURE_STYLES: ArchitectureStyle[] = [
  {
    id: 'modern-luxury',
    name: 'Modern Luxury',
    nameVi: 'Hiện Đại Sang Trọng',
    description: 'Thiết kế tối giản với vật liệu cao cấp, không gian mở, ánh sáng tự nhiên',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    tags: ['minimalist', 'luxury', 'open-space'],
  },
  {
    id: 'neoclassical',
    name: 'Neoclassical',
    nameVi: 'Tân Cổ Điển',
    description: 'Kết hợp yếu tố cổ điển châu Âu với tiện nghi hiện đại',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    tags: ['classic', 'elegant', 'european'],
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    nameVi: 'Tối Giản',
    description: 'Thiết kế đơn giản, chức năng, màu sắc trung tính',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
    tags: ['simple', 'functional', 'clean'],
  },
  {
    id: 'tropical-villa',
    name: 'Tropical Villa',
    nameVi: 'Biệt Thự Nhiệt Đới',
    description: 'Hòa quyện với thiên nhiên, cây xanh, hồ bơi, view biển/núi',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    tags: ['tropical', 'nature', 'resort'],
  },
  {
    id: 'industrial-loft',
    name: 'Industrial Loft',
    nameVi: 'Công Nghiệp Loft',
    description: 'Gạch trần, thép lộ, trần cao, không gian sáng tạo',
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=800&q=80',
    tags: ['industrial', 'loft', 'creative'],
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    nameVi: 'Bắc Âu',
    description: 'Gỗ sáng màu, không gian ấm cúng, thiết kế tinh tế',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
    tags: ['scandinavian', 'cozy', 'wood'],
  },
  {
    id: 'japanese-zen',
    name: 'Japanese Zen',
    nameVi: 'Nhật Bản Thiền Định',
    description: 'Đơn giản, hài hòa, vườn zen, vật liệu tự nhiên',
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80',
    tags: ['japanese', 'zen', 'harmony'],
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean',
    nameVi: 'Địa Trung Hải',
    description: 'Màu trắng xanh, vòm cong, sân trong, view biển',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    tags: ['mediterranean', 'coastal', 'villa'],
  },
];

export const CONSULTING_TOPICS: ConsultingTopic[] = [
  {
    id: 'perfex-modules',
    title: 'Phát Triển Module Perfex',
    icon: '🔧',
    questions: [
      'Làm sao để tạo module mới cho Perfex CRM?',
      'Cách sử dụng hooks system trong Perfex?',
      'Best practices cho Perfex module development?',
      'Làm sao integrate API bên ngoài vào Perfex?',
    ],
  },
  {
    id: 'gemini-integration',
    title: 'Tích Hợp Gemini AI',
    icon: '🤖',
    questions: [
      'Cách kết nối Gemini API với PHP?',
      'Làm sao generate nội dung AI trong Perfex?',
      'Tích hợp chatbot AI vào customer portal?',
      'Sử dụng Gemini Vision cho document processing?',
    ],
  },
  {
    id: 'architecture-design',
    title: 'Thiết Kế Kiến Trúc',
    icon: '🏛️',
    questions: [
      'Thiết kế biệt thự 3 tầng hiện đại?',
      'Layout resort nghỉ dưỡng 5 sao?',
      'Quy hoạch khu dân cư cao cấp?',
      'Thiết kế văn phòng làm việc hiện đại?',
    ],
  },
  {
    id: 'database-optimization',
    title: 'Tối Ưu Database',
    icon: '🗄️',
    questions: [
      'Tối ưu query chậm trong Perfex?',
      'Caching strategies cho CRM?',
      'Database schema cho module mới?',
      'Migration data giữa các version?',
    ],
  },
  {
    id: 'api-development',
    title: 'Phát Triển API',
    icon: '🔗',
    questions: [
      'Tạo REST API cho mobile app?',
      'Authentication với JWT trong Perfex?',
      'Rate limiting và security?',
      'Webhook integration?',
    ],
  },
  {
    id: 'ui-ux-design',
    title: 'Thiết Kế UI/UX',
    icon: '🎨',
    questions: [
      'Custom theme cho Perfex admin?',
      'Responsive design best practices?',
      'UX improvements cho customer portal?',
      'Dashboard design patterns?',
    ],
  },
];

export const CODE_TEMPLATES: CodeTemplate[] = [
  {
    id: 'gemini-hook',
    name: 'Gemini AI Hook',
    description: 'Hook tích hợp Gemini AI vào Perfex CRM',
    category: 'hook',
    code: `<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Gemini AI Hook for Perfex CRM
 * Tự động generate content sử dụng Gemini AI
 */
hooks()->add_action('before_proposal_created', 'gemini_auto_generate_proposal');

function gemini_auto_generate_proposal($data) {
    $CI = &get_instance();
    $CI->load->library('gemini_ai');
    
    if (empty($data['content'])) {
        $prompt = "Tạo proposal chuyên nghiệp cho: " . $data['subject'];
        $data['content'] = $CI->gemini_ai->generate_text($prompt);
    }
    
    return $data;
}`,
  },
  {
    id: 'ai-controller',
    name: 'AI Controller',
    description: 'Controller xử lý các request AI',
    category: 'controller',
    code: `<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Ai extends AdminController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('ai_model');
        $this->load->library('gemini_ai');
    }
    
    public function generate()
    {
        if ($this->input->is_ajax_request()) {
            $prompt = $this->input->post('prompt');
            $type = $this->input->post('type', TRUE);
            
            try {
                $result = $this->gemini_ai->generate($prompt, $type);
                echo json_encode(['success' => true, 'data' => $result]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
        }
    }
    
    public function history()
    {
        $data['history'] = $this->ai_model->get_generation_history();
        $this->load->view('admin/ai/history', $data);
    }
}`,
  },
  {
    id: 'gemini-library',
    name: 'Gemini Library',
    description: 'Library wrapper cho Gemini API',
    category: 'helper',
    code: `<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Gemini AI Library for Perfex CRM
 * @author ThietKeResort
 */
class Gemini_ai
{
    private $api_key;
    private $api_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    private $CI;
    
    public function __construct()
    {
        $this->CI = &get_instance();
        $this->api_key = get_option('gemini_api_key');
    }
    
    public function generate_text($prompt, $options = [])
    {
        $data = [
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ],
            'generationConfig' => [
                'temperature' => $options['temperature'] ?? 0.7,
                'maxOutputTokens' => $options['max_tokens'] ?? 2048,
            ]
        ];
        
        $response = $this->_make_request($data);
        
        return $response['candidates'][0]['content']['parts'][0]['text'] ?? '';
    }
    
    private function _make_request($data)
    {
        $ch = curl_init($this->api_url . '?key=' . $this->api_key);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        ]);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
}`,
  },
];

export const QUICK_ACTIONS = [
  {
    id: 'create-module',
    title: 'Tạo Module Mới',
    description: 'Khởi tạo cấu trúc module Perfex CRM',
    icon: '📦',
  },
  {
    id: 'add-ai-chat',
    title: 'Thêm AI Chatbot',
    description: 'Tích hợp chatbot vào customer portal',
    icon: '🤖',
  },
  {
    id: 'design-villa',
    title: 'Thiết Kế Biệt Thự',
    description: 'Tạo concept thiết kế kiến trúc',
    icon: '🏡',
  },
  {
    id: 'generate-proposal',
    title: 'Tạo Proposal AI',
    description: 'Auto-generate proposal content',
    icon: '📝',
  },
  {
    id: 'analyze-code',
    title: 'Phân Tích Code',
    description: 'Review và optimize PHP code',
    icon: '🔍',
  },
  {
    id: 'api-docs',
    title: 'Tạo API Docs',
    description: 'Generate API documentation',
    icon: '📚',
  },
];
