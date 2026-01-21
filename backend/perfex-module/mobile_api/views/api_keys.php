<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php init_head(); ?>
<div id="wrapper">
    <div class="content">
        <div class="row">
            <div class="col-md-10 col-md-offset-1">
                <div class="panel_s">
                    <div class="panel-body">
                        <h4 class="no-margin font-bold">
                            <i class="fa fa-key"></i> Mobile API - API Keys
                        </h4>
                        <hr class="hr-panel-heading" />
                        
                        <!-- Create new key form -->
                        <div class="row mbot20">
                            <div class="col-md-6">
                                <?php echo form_open(admin_url('mobile_api/api_keys'), ['class' => 'form-inline']); ?>
                                <input type="hidden" name="action" value="create">
                                <div class="form-group">
                                    <input type="text" name="name" class="form-control" placeholder="Tên API Key" required style="width: 250px;">
                                </div>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fa fa-plus"></i> Tạo API Key mới
                                </button>
                                <?php echo form_close(); ?>
                            </div>
                        </div>
                        
                        <!-- API Keys table -->
                        <div class="table-responsive">
                            <table class="table table-striped table-bordered">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Tên</th>
                                        <th>API Key</th>
                                        <th>Trạng thái</th>
                                        <th>Tạo lúc</th>
                                        <th>Dùng gần nhất</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($api_keys as $key): ?>
                                    <tr>
                                        <td><?php echo $key->id; ?></td>
                                        <td><?php echo htmlspecialchars($key->name); ?></td>
                                        <td>
                                            <code class="api-key-code"><?php echo substr($key->api_key, 0, 20); ?>...</code>
                                            <button type="button" class="btn btn-xs btn-default copy-key" data-key="<?php echo $key->api_key; ?>" title="Copy">
                                                <i class="fa fa-copy"></i>
                                            </button>
                                        </td>
                                        <td>
                                            <?php if ($key->active): ?>
                                                <span class="label label-success">Active</span>
                                            <?php else: ?>
                                                <span class="label label-danger">Inactive</span>
                                            <?php endif; ?>
                                        </td>
                                        <td><?php echo date('d/m/Y H:i', strtotime($key->created_at)); ?></td>
                                        <td><?php echo $key->last_used ? date('d/m/Y H:i', strtotime($key->last_used)) : '-'; ?></td>
                                        <td>
                                            <?php echo form_open(admin_url('mobile_api/api_keys'), ['style' => 'display:inline']); ?>
                                            <input type="hidden" name="action" value="toggle">
                                            <input type="hidden" name="id" value="<?php echo $key->id; ?>">
                                            <button type="submit" class="btn btn-xs btn-<?php echo $key->active ? 'warning' : 'success'; ?>">
                                                <?php echo $key->active ? 'Tắt' : 'Bật'; ?>
                                            </button>
                                            <?php echo form_close(); ?>
                                            
                                            <?php echo form_open(admin_url('mobile_api/api_keys'), ['style' => 'display:inline', 'onsubmit' => 'return confirm("Xóa API Key này?")']); ?>
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?php echo $key->id; ?>">
                                            <button type="submit" class="btn btn-xs btn-danger">
                                                <i class="fa fa-trash"></i>
                                            </button>
                                            <?php echo form_close(); ?>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php init_tail(); ?>
<script>
$(function() {
    $('.copy-key').on('click', function() {
        var key = $(this).data('key');
        navigator.clipboard.writeText(key).then(function() {
            alert_float('success', 'API Key đã được copy!');
        });
    });
});
</script>
