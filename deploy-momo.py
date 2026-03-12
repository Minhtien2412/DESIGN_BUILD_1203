import subprocess, sys, os

VPS = "root@103.200.20.100"
BE_DIR = "/var/www/baotienweb-api"

def run(cmd, desc=""):
    if desc: print(f"\n{'='*60}\n{desc}\n{'='*60}")
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=120)
    if r.stdout: print(r.stdout[-2000:])
    if r.returncode != 0 and r.stderr: print("STDERR:", r.stderr[-1000:])
    return r.returncode == 0

# 1. Upload momo-payment.service.ts
print("1. Uploading momo-payment.service.ts...")
run(f'scp -o StrictHostKeyChecking=no "C:/tien/New folder/APP_DESIGN_BUILD05.12.2025/BE-baotienweb.cloud/src/payment/momo-payment.service.ts" {VPS}:{BE_DIR}/src/payment/', "Upload MoMo service")

# 2. Upload updated payment.module.ts
print("2. Uploading payment.module.ts...")
run(f'scp -o StrictHostKeyChecking=no "C:/tien/New folder/APP_DESIGN_BUILD05.12.2025/BE-baotienweb.cloud/src/payment/payment.module.ts" {VPS}:{BE_DIR}/src/payment/', "Upload payment module")

# 3. Upload updated payment.controller.ts
print("3. Uploading payment.controller.ts...")
run(f'scp -o StrictHostKeyChecking=no "C:/tien/New folder/APP_DESIGN_BUILD05.12.2025/BE-baotienweb.cloud/src/payment/payment.controller.ts" {VPS}:{BE_DIR}/src/payment/', "Upload payment controller")

# 4. Add MoMo env vars to VPS .env
print("4. Adding MoMo env vars to VPS .env...")
momo_env = '''

# ============================
# MOMO PAYMENT GATEWAY
# ============================
MOMO_PARTNER_CODE="MOMO"
MOMO_ACCESS_KEY="F8BBA842ECF85"
MOMO_SECRET_KEY="K951B6PE1waDMi640xX08PD3vg6EkVlz"
MOMO_API_URL="https://test-payment.momo.vn/v2/gateway/api"
MOMO_RETURN_URL="https://baotienweb.cloud/api/v1/payment/momo/return"
MOMO_IPN_URL="https://baotienweb.cloud/api/v1/payment/momo/ipn"
'''
# Check if already exists
check = subprocess.run(f'ssh {VPS} "grep -c MOMO_PARTNER_CODE {BE_DIR}/.env"', shell=True, capture_output=True, text=True)
if check.stdout.strip() == "0" or check.returncode != 0:
    # Escape for shell
    escaped = momo_env.replace('"', '\\"')
    run(f'ssh {VPS} "echo \\"{escaped}\\" >> {BE_DIR}/.env"', "Append MoMo env vars")
    print("MoMo env vars added")
else:
    print("MoMo env vars already exist, skipping")

# 5. Build on VPS
print("\n5. Building on VPS...")
run(f'ssh {VPS} "cd {BE_DIR} && rm -rf dist && npx nest build 2>&1 | tail -5"', "Build NestJS")

# 6. Restart PM2
print("\n6. Restarting PM2...")
run(f'ssh {VPS} "cd {BE_DIR} && pm2 restart baotienweb-api --update-env 2>&1 | tail -10"', "Restart PM2")

# 7. Wait and check health
import time
time.sleep(3)
print("\n7. Health check...")
run(f'ssh {VPS} "curl -s -o /dev/null -w \'HTTP %{{http_code}}\' https://baotienweb.cloud/api/health"', "Health check")

print("\n✅ Deployment complete!")
