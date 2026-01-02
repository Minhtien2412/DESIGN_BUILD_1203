<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php init_head(); ?>
<div id="wrapper">
    <div class="content">
        <div class="row">
            <div class="col-md-10 col-md-offset-1">
                <div class="panel_s">
                    <div class="panel-body">
                        <h4 class="no-margin font-bold">
                            <i class="fa fa-list"></i> Mobile API - Logs
                            <a href="<?php echo admin_url('mobile_api/clear_logs'); ?>" 
                               class="btn btn-danger btn-sm pull-right"
                               onclick="return confirm('Xóa tất cả logs?')">
                                <i class="fa fa-trash"></i> Xóa tất cả
                            </a>
                        </h4>
                        <hr class="hr-panel-heading" />
                        
                        <p class="text-muted">Tổng: <?php echo number_format($total); ?> requests</p>
                        
                        <div class="table-responsive">
                            <table class="table table-striped table-bordered table-sm">
                                <thead>
                                    <tr>
                                        <th>Thời gian</th>
                                        <th>Method</th>
                                        <th>Endpoint</th>
                                        <th>IP</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($logs as $log): ?>
                                    <tr>
                                        <td><?php echo date('d/m/Y H:i:s', strtotime($log->created_at)); ?></td>
                                        <td>
                                            <span class="label label-<?php 
                                                echo $log->method === 'GET' ? 'primary' : 
                                                    ($log->method === 'POST' ? 'success' : 
                                                    ($log->method === 'DELETE' ? 'danger' : 'default')); 
                                            ?>">
                                                <?php echo $log->method; ?>
                                            </span>
                                        </td>
                                        <td><code><?php echo htmlspecialchars($log->endpoint); ?></code></td>
                                        <td><?php echo $log->ip_address; ?></td>
                                        <td>
                                            <span class="label label-<?php echo $log->response_code < 400 ? 'success' : 'danger'; ?>">
                                                <?php echo $log->response_code; ?>
                                            </span>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Pagination -->
                        <?php if ($total > $limit): ?>
                        <nav>
                            <ul class="pagination">
                                <?php for ($i = 1; $i <= ceil($total / $limit); $i++): ?>
                                <li class="<?php echo $i == $page ? 'active' : ''; ?>">
                                    <a href="<?php echo admin_url('mobile_api/logs?page=' . $i); ?>"><?php echo $i; ?></a>
                                </li>
                                <?php endfor; ?>
                            </ul>
                        </nav>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php init_tail(); ?>
