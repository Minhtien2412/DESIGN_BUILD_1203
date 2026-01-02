# Quick SSH Backend Setup Script
# This script helps you manually deploy the backend modules

Write-Host "========================================"
Write-Host "🚀 Backend Deployment Helper"
Write-Host "========================================"
Write-Host ""
Write-Host "Please follow these steps to deploy the backend modules:" -ForegroundColor Cyan
Write-Host ""

# Step 1
Write-Host "STEP 1: SSH into the server" -ForegroundColor Yellow
Write-Host "----------------------------------------"
Write-Host "Run this command in a new terminal:"
Write-Host ""
Write-Host "  ssh root@103.200.20.100" -ForegroundColor Green
Write-Host ""
Write-Host "Password: 6k4BOIRDwWhsM39F2DyM" -ForegroundColor Magenta
Write-Host ""

# Step 2
Write-Host "STEP 2: Download and run the deployment script" -ForegroundColor Yellow
Write-Host "----------------------------------------"
Write-Host "Once connected, run these commands:"
Write-Host ""

$deployScript = @'
cd /var/www/baotienweb-api

# Create profile module
mkdir -p src/profile/dto

# Profile Controller
cat > src/profile/profile.controller.ts << 'EOF'
import {
  Controller, Get, Patch, Post, Delete, Body, UseGuards, UseInterceptors,
  UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator,
  HttpCode, HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/guards";
import { CurrentUser } from "../auth/decorators";
import { ProfileService } from "./profile.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@ApiTags("Profile")
@Controller({ path: "profile", version: "1" })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: "Get current user profile" })
  async getProfile(@CurrentUser() user: any) {
    return this.profileService.getProfile(user.id);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update current user profile" })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(user.id, dto);
  }

  @Post("avatar")
  @HttpCode(HttpStatus.OK)
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("avatar"))
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
      ],
    })) file: Express.Multer.File,
  ) {
    return this.profileService.uploadAvatar(user.id, file);
  }

  @Delete("avatar")
  @HttpCode(HttpStatus.OK)
  async deleteAvatar(@CurrentUser() user: any) {
    return this.profileService.deleteAvatar(user.id);
  }
}
EOF

echo "Profile controller created"
'@

Write-Host $deployScript -ForegroundColor Gray
Write-Host ""
Write-Host ""

# Step 3
Write-Host "STEP 3: See full deployment guide" -ForegroundColor Yellow
Write-Host "----------------------------------------"
Write-Host "For complete instructions, see:"
Write-Host "  - BACKEND_DEPLOYMENT_MANUAL.md"
Write-Host "  - backend-files/deploy-backend.sh (complete bash script)"
Write-Host ""

# Step 4
Write-Host "STEP 4: Update app.module.ts" -ForegroundColor Yellow
Write-Host "----------------------------------------"
Write-Host "After creating all files, edit src/app.module.ts:"
Write-Host ""
Write-Host @"
import { ProfileModule } from './profile/profile.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // ...existing modules...
    ProfileModule,
    NotificationsModule,
  ],
})
"@ -ForegroundColor Gray
Write-Host ""

# Step 5
Write-Host "STEP 5: Build and restart" -ForegroundColor Yellow
Write-Host "----------------------------------------"
Write-Host "npm run build && pm2 restart baotienweb-api" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================"
Write-Host "📁 All backend files are in: backend-files/" -ForegroundColor Cyan
Write-Host "========================================"
