<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php init_head(); ?>
<div id="wrapper">
    <div class="content">
        <div class="row">
            <div class="col-md-8 col-md-offset-2">
                <div class="panel_s">
                    <div class="panel-body">
                        <h4 class="no-margin font-bold">
                            <i class="fa fa-mobile"></i> Mobile API - Cài đặt
                        </h4>
                        <hr class="hr-panel-heading" />
                        
                        <?php echo form_open(admin_url('mobile_api/settings')); ?>
                        
                        <div class="form-group">
                            <label class="control-label">
                                <input type="checkbox" name="mobile_api_enabled" value="1" 
                                    <?php echo $settings['enabled'] == '1' ? 'checked' : ''; ?>>
                                Kích hoạt Mobile API
                            </label>
                            <p class="text-muted">Bật/tắt tất cả các endpoint API</p>
                        </div>
                        
                        <div class="form-group">
                            <label class="control-label">Rate Limit (requests/phút)</label>
                            <input type="number" name="mobile_api_rate_limit" class="form-control" 
                                value="<?php echo $settings['rate_limit']; ?>" min="1" max="1000">
                            <p class="text-muted">Số request tối đa cho mỗi API key trong 1 phút</p>
                        </div>
                        
                        <div class="form-group">
                            <label class="control-label">
                                <input type="checkbox" name="mobile_api_log_requests" value="1" 
                                    <?php echo $settings['log_requests'] == '1' ? 'checked' : ''; ?>>
                                Ghi log requests
                            </label>
                            <p class="text-muted">Lưu lịch sử tất cả API requests (có thể ảnh hưởng performance)</p>
                        </div>
                        
                        <div class="form-group">
                            <label class="control-label">
                                <input type="checkbox" name="mobile_api_allow_registration" value="1" 
                                    <?php echo $settings['allow_registration'] == '1' ? 'checked' : ''; ?>>
                                Cho phép đăng ký qua API
                            </label>
                            <p class="text-muted">Cho phép người dùng đăng ký tài khoản mới qua Mobile App</p>
                        </div>
                        
                        <hr>
                        
                        <div class="form-group">
                            <label class="control-label">Base API URL</label>
                            <input type="text" class="form-control" readonly 
                                value="<?php echo site_url('api/v1'); ?>">
                        </div>
                        
                        <button type="submit" class="btn btn-primary">
                            <i class="fa fa-save"></i> Lưu cài đặt
                        </button>
                        
                        <?php echo form_close(); ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php init_tail(); ?>
