import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    UploadedFile,
    UploadedFiles,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileCategory } from './entities/uploaded-file.entity';
import { FileUploadService } from './file-upload.service';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
  ) {
    return this.fileUploadService.uploadFile(file, uploadDto);
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: UploadFileDto,
  ) {
    return this.fileUploadService.uploadMultiple(files, uploadDto);
  }

  @Get(':id')
  async getFile(@Param('id', ParseIntPipe) id: number) {
    return this.fileUploadService.getFile(id);
  }

  @Get('resource/:type/:id')
  async getFilesByResource(
    @Param('type') resourceType: string,
    @Param('id', ParseIntPipe) resourceId: number,
  ) {
    return this.fileUploadService.getFilesByResource(resourceType, resourceId);
  }

  @Get('category/:category')
  async getFilesByCategory(@Param('category') category: FileCategory) {
    return this.fileUploadService.getFilesByCategory(category);
  }

  @Get(':id/url')
  async getPublicUrl(@Param('id', ParseIntPipe) id: number) {
    const url = await this.fileUploadService.getPublicUrl(id);
    return { url };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Param('id', ParseIntPipe) id: number) {
    await this.fileUploadService.deleteFile(id);
  }
}
