#!/usr/bin/env python3
with open('/var/www/baotienweb-api/public/admin-crm.html','r') as f:
    c=f.read()

insert_text = "          'api-management': {\n            el: 'page-api-management',\n            title: 'API Management',\n            loader: loadApiTokens,\n          },\n          'api-manual': {\n            el: 'page-api-manual',\n            title: 'API Manual',\n            loader: null,\n          },\n"

pm_start = c.find('pageMap')
pm_section = c[pm_start:pm_start+3000]

if 'api-management' not in pm_section:
    c = c.replace('          settings: {', insert_text + '          settings: {', 1)
    with open('/var/www/baotienweb-api/public/admin-crm.html','w') as f:
        f.write(c)
    print('ADDED api-management to pageMap')
else:
    print('ALREADY in pageMap')
