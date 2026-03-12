#!/bin/bash
cd /var/www/baotienweb-api

HTML="public/admin-crm.html"

echo "=== Fixing API Management page integration ==="

# 1. Add api-management to the pageMap in navigateTo function
# Find the settings entry and add api-management before it
python3 << 'PYEOF'
import re

with open('public/admin-crm.html', 'r', encoding='utf-8') as f:
    content = f.read()

original = content

# 1. Add api-management to pageMap (before settings entry)
api_management_entry = """          'api-management': {
            el: 'page-api-management',
            title: 'API Management',
            loader: loadApiTokens,
          },
          'api-manual': {
            el: 'page-api-manual',
            title: 'API Manual',
            loader: null,
          },"""

if "'api-management'" not in content:
    # Insert before settings entry in pageMap
    content = content.replace(
        "          settings: {",
        api_management_entry + "\n          settings: {"
    )
    print("  Added api-management to pageMap")

# 2. Fix the page div - change style="display:none;" to class="hidden"
# and make sure it's inside contentArea
content = content.replace(
    '<div id="page-api-management" class="page-content" style="display:none;">',
    '<div id="page-api-management" class="hidden">'
)
print("  Fixed page div visibility class")

# 3. Move the page-api-management block inside contentArea if it's outside
# Check if it's outside contentArea
content_area_end = content.find('</div>\n      </div>\n      <!-- End Content Area -->')
if content_area_end == -1:
    # Find the closing of contentArea differently
    # Look for the settings page div and count from there
    settings_div = content.find('id="settingsContent"')
    if settings_div > 0:
        # Find the next closing div set after settingsContent
        pass

# If page-api-management is after contentArea, we need to move it inside
api_page_start = content.find('<div id="page-api-management"')
content_area_start = content.find('id="contentArea"')

if api_page_start > 0:
    # Find the end of this page section (find the matching closing div)
    # The page starts with <div id="page-api-management"...> and ends with the modals
    
    # Actually, let's find where contentArea ends and where our page is
    # If our page is outside contentArea, we need to check
    
    # Let's find all children of contentArea
    # The contentArea starts around line 703
    # Our page should be a direct child of contentArea
    
    # For safety, let's check if our page div is in the right place by looking 
    # at what comes before it
    before_api = content[max(0, api_page_start-200):api_page_start]
    if 'contentArea' not in before_api and 'page-content' not in before_api:
        print("  WARNING: page-api-management may be outside contentArea")
        print("  Attempting to relocate...")
        
        # Extract the full API management section (page + modals)
        # Find the end marker
        api_end_markers = [
            '<!-- Token Detail Modal -->',  # After page div, modals follow
            '<!-- API Management Page -->',  # The comment before
        ]
        
        # Extract everything from <!-- API Management Page --> to the end of tokenDetailModal
        api_section_start = content.find('<!-- API Management Page -->')
        if api_section_start > 0:
            # Find the end of the last modal (tokenDetailModal's closing </div>s)
            detail_modal = content.find('id="tokenDetailModal"', api_section_start)
            if detail_modal > 0:
                # Find the closing of this modal
                end_pos = detail_modal
                depth = 0
                found_start = False
                for i in range(detail_modal, len(content)):
                    if content[i:i+4] == '<div':
                        depth += 1
                        found_start = True
                    elif content[i:i+6] == '</div>':
                        depth -= 1
                        if found_start and depth <= 0:
                            end_pos = i + 6
                            break
                
                api_section = content[api_section_start:end_pos]
                
                # Remove from current position
                content = content[:api_section_start] + content[end_pos:]
                
                # Find where to insert - before the closing of contentArea
                # Look for the last page div inside contentArea
                chat_content = content.find('id="chatContent"')
                settings_content = content.find('id="settingsContent"')
                
                # Insert before the end of the last content div inside contentArea
                insert_before = max(chat_content, settings_content)
                if insert_before > 0:
                    # Find the closing div of this content
                    pos = insert_before
                    depth2 = 0
                    found = False
                    for i in range(pos, len(content)):
                        if content[i:i+4] == '<div':
                            depth2 += 1
                            found = True
                        elif content[i:i+6] == '</div>':
                            depth2 -= 1
                            if found and depth2 <= 0:
                                insert_pos = i + 6
                                content = content[:insert_pos] + '\n\n          ' + api_section + '\n' + content[insert_pos:]
                                print("  Relocated page inside contentArea")
                                break

# 4. Add API Manual stub page if not present
if 'id="page-api-manual"' not in content:
    api_manual_html = """
          <div id="page-api-manual" class="hidden">
            <h4><i class="bi bi-book text-primary me-2"></i>API Manual</h4>
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <h5>REST API Documentation</h5>
                <p>Base URL: <code>https://baotienweb.cloud/api/v1</code></p>
                <h6 class="mt-3">Authentication</h6>
                <p>All requests require:</p>
                <ul>
                  <li><code>x-api-key</code> header with your API key</li>
                  <li><code>Authorization: Bearer &lt;token&gt;</code> header for authenticated endpoints</li>
                </ul>
                <h6 class="mt-3">Available Endpoints</h6>
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead>
                    <tbody>
                      <tr><td><span class="badge bg-success">GET</span></td><td>/api-management</td><td>List API tokens</td></tr>
                      <tr><td><span class="badge bg-primary">POST</span></td><td>/api-management</td><td>Create API token</td></tr>
                      <tr><td><span class="badge bg-success">GET</span></td><td>/api-management/:id</td><td>Get token details</td></tr>
                      <tr><td><span class="badge bg-warning">PUT</span></td><td>/api-management/:id</td><td>Update token</td></tr>
                      <tr><td><span class="badge bg-danger">DELETE</span></td><td>/api-management/:id</td><td>Delete token</td></tr>
                      <tr><td><span class="badge bg-primary">POST</span></td><td>/api-management/:id/regenerate</td><td>Regenerate token</td></tr>
                      <tr><td><span class="badge bg-info">PATCH</span></td><td>/api-management/:id/toggle</td><td>Toggle active status</td></tr>
                      <tr><td><span class="badge bg-success">GET</span></td><td>/api-management/stats</td><td>Token statistics</td></tr>
                      <tr><td><span class="badge bg-primary">POST</span></td><td>/api-management/validate</td><td>Validate a token</td></tr>
                      <tr><td colspan="3" class="fw-bold pt-3">CRM</td></tr>
                      <tr><td><span class="badge bg-success">GET</span></td><td>/crm/clients</td><td>List clients</td></tr>
                      <tr><td><span class="badge bg-success">GET</span></td><td>/crm/projects</td><td>List projects</td></tr>
                      <tr><td><span class="badge bg-success">GET</span></td><td>/crm/tasks</td><td>List tasks</td></tr>
                      <tr><td><span class="badge bg-success">GET</span></td><td>/crm/invoices</td><td>List invoices</td></tr>
                      <tr><td><span class="badge bg-success">GET</span></td><td>/crm/tickets</td><td>List tickets</td></tr>
                      <tr><td><span class="badge bg-success">GET</span></td><td>/crm/dashboard</td><td>CRM dashboard stats</td></tr>
                      <tr><td colspan="3" class="fw-bold pt-3">Users</td></tr>
                      <tr><td><span class="badge bg-success">GET</span></td><td>/users/admin/list</td><td>List users</td></tr>
                      <tr><td><span class="badge bg-success">GET</span></td><td>/users/admin/:id</td><td>Get user details</td></tr>
                      <tr><td><span class="badge bg-warning">PUT</span></td><td>/users/admin/:id</td><td>Update user</td></tr>
                      <tr><td colspan="3" class="fw-bold pt-3">Chat</td></tr>
                      <tr><td><span class="badge bg-success">GET</span></td><td>/chat/rooms</td><td>List chat rooms</td></tr>
                      <tr><td><span class="badge bg-primary">POST</span></td><td>/chat/rooms</td><td>Create chat room</td></tr>
                      <tr><td><span class="badge bg-success">GET</span></td><td>/chat/rooms/:roomId/messages</td><td>Get messages</td></tr>
                      <tr><td><span class="badge bg-primary">POST</span></td><td>/chat/messages</td><td>Send message</td></tr>
                      <tr><td colspan="3" class="fw-bold pt-3">Notifications</td></tr>
                      <tr><td><span class="badge bg-success">GET</span></td><td>/notifications</td><td>List notifications</td></tr>
                      <tr><td><span class="badge bg-primary">POST</span></td><td>/notifications</td><td>Create notification</td></tr>
                      <tr><td><span class="badge bg-info">PATCH</span></td><td>/notifications/:id/read</td><td>Mark as read</td></tr>
                      <tr><td><span class="badge bg-info">PATCH</span></td><td>/notifications/read-all</td><td>Mark all as read</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>"""
    
    # Insert after page-api-management section
    api_page_pos = content.find('id="page-api-management"')
    if api_page_pos > 0:
        # Find a good spot after the API management page
        # Look for the modals section
        token_modal = content.find('id="tokenModal"', api_page_pos)
        if token_modal > 0:
            detail_modal = content.find('id="tokenDetailModal"', token_modal)
            if detail_modal > 0:
                # Find end of detail modal
                end_pos = detail_modal
                depth = 0
                found = False
                for i in range(detail_modal, min(detail_modal + 2000, len(content))):
                    if content[i:i+4] == '<div':
                        depth += 1
                        found = True
                    elif content[i:i+6] == '</div>':
                        depth -= 1
                        if found and depth <= 0:
                            end_pos = i + 6
                            break
                content = content[:end_pos] + '\n' + api_manual_html + content[end_pos:]
                print("  Added API Manual page")

with open('public/admin-crm.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("  HTML update complete!")
PYEOF

echo "DONE"
