import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUtilityDto, UpdateUtilityDto, UtilityQueryDto } from './dto';
import { UtilitiesService } from './utilities.service';

@ApiTags('App Utilities')
@Controller({ path: 'utilities', version: '1' })
export class UtilitiesController {
  constructor(private readonly utilitiesService: UtilitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tiện ích ứng dụng' })
  @ApiResponse({ status: 200, description: 'Utilities retrieved successfully' })
  findAll(@Query() query: UtilityQueryDto) {
    return this.utilitiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết tiện ích' })
  @ApiResponse({ status: 200, description: 'Utility retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Utility not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.utilitiesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo tiện ích mới' })
  @ApiResponse({ status: 201, description: 'Utility created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createUtilityDto: CreateUtilityDto, @CurrentUser() user: any) {
    return this.utilitiesService.create(createUtilityDto, user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật tiện ích' })
  @ApiResponse({ status: 200, description: 'Utility updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Utility not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUtilityDto: UpdateUtilityDto,
    @CurrentUser() user: any,
  ) {
    return this.utilitiesService.update(id, updateUtilityDto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa tiện ích' })
  @ApiResponse({ status: 204, description: 'Utility deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Utility not found' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.utilitiesService.remove(id, user.userId);
  }

  @Patch(':id/toggle-enabled')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bật/tắt tiện ích' })
  @ApiResponse({ status: 200, description: 'Utility enabled status toggled' })
  toggleEnabled(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.utilitiesService.toggleEnabled(id, user.userId);
  }

  @Post(':id/use')
  @ApiOperation({ summary: 'Tăng số lần sử dụng tiện ích' })
  @ApiResponse({ status: 200, description: 'Use count incremented' })
  incrementUseCount(@Param('id', ParseIntPipe) id: number) {
    return this.utilitiesService.incrementUseCount(id);
  }
}
