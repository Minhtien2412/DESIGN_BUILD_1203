import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as exifParser from 'exif-parser';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import { Repository } from 'typeorm';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileCategory, FileType, UploadedFile } from './entities/uploaded-file.entity';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(UploadedFile)
    private readonly fileRepository: Repository<UploadedFile>,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    uploadDto: UploadFileDto,
  ): Promise<UploadedFile> {
    const fileType = this.determineFileType(file.mimetype);
    const metadata = uploadDto.extractMetadata
      ? await this.extractMetadata(file)
      : {};

    if (uploadDto.createThumbnail && fileType === FileType.IMAGE) {
      metadata.thumbnail = await this.generateThumbnail(file.path);
    }

    const uploadedFile = this.fileRepository.create({
      originalName: file.originalname,
      filename: file.filename,
      filepath: file.path,
      mimetype: file.mimetype,
      size: file.size,
      type: fileType,
      category: uploadDto.category || FileCategory.OTHER,
      userId: uploadDto.userId,
      resourceType: uploadDto.resourceType,
      resourceId: uploadDto.resourceId,
      metadata,
      isPublic: uploadDto.isPublic || false,
      url: this.generatePublicUrl(file.path),
    });

    return this.fileRepository.save(uploadedFile);
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    uploadDto: UploadFileDto,
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, uploadDto));
    return Promise.all(uploadPromises);
  }

  async getFile(id: number): Promise<UploadedFile> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
  }

  async getFilesByResource(
    resourceType: string,
    resourceId: number,
  ): Promise<UploadedFile[]> {
    return this.fileRepository.find({
      where: { resourceType, resourceId },
      order: { createdAt: 'DESC' },
    });
  }

  async getFilesByCategory(category: FileCategory): Promise<UploadedFile[]> {
    return this.fileRepository.find({
      where: { category },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteFile(id: number): Promise<void> {
    const file = await this.getFile(id);

    // Delete physical file
    try {
      await fs.unlink(file.filepath);
      if (file.metadata?.thumbnail) {
        await fs.unlink(file.metadata.thumbnail);
      }
    } catch (error) {
      console.error('Error deleting physical file:', error);
    }

    await this.fileRepository.delete(id);
  }

  async getPublicUrl(id: number): Promise<string> {
    const file = await this.getFile(id);
    if (!file.isPublic) {
      throw new NotFoundException('File is not public');
    }
    return file.url || this.generatePublicUrl(file.filepath);
  }

  // Helper methods
  private determineFileType(mimetype: string): FileType {
    if (mimetype.startsWith('image/')) return FileType.IMAGE;
    if (mimetype.startsWith('video/')) return FileType.VIDEO;
    if (
      mimetype.includes('pdf') ||
      mimetype.includes('document') ||
      mimetype.includes('word') ||
      mimetype.includes('excel')
    ) {
      return FileType.DOCUMENT;
    }
    return FileType.OTHER;
  }

  private async extractMetadata(file: Express.Multer.File): Promise<any> {
    const metadata: any = {};

    if (file.mimetype.startsWith('image/')) {
      try {
        const image = sharp(file.path);
        const imageMetadata = await image.metadata();
        metadata.width = imageMetadata.width;
        metadata.height = imageMetadata.height;

        // Extract EXIF data
        const buffer = await fs.readFile(file.path);
        const parser = exifParser.create(buffer);
        const exifData = parser.parse();

        if (exifData.tags) {
          metadata.exif = exifData.tags;

          // Extract GPS coordinates
          if (exifData.tags.GPSLatitude && exifData.tags.GPSLongitude) {
            metadata.gps = {
              latitude: exifData.tags.GPSLatitude,
              longitude: exifData.tags.GPSLongitude,
              altitude: exifData.tags.GPSAltitude,
            };
          }
        }
      } catch (error) {
        console.error('Error extracting image metadata:', error);
      }
    }

    return metadata;
  }

  private async generateThumbnail(filepath: string): Promise<string> {
    try {
      const thumbnailPath = filepath.replace(
        path.extname(filepath),
        `_thumb${path.extname(filepath)}`,
      );

      await sharp(filepath)
        .resize(200, 200, {
          fit: 'cover',
          position: 'center',
        })
        .toFile(thumbnailPath);

      return thumbnailPath;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  }

  private generatePublicUrl(filepath: string): string {
    // In production, this would return a CDN/S3 URL
    // For now, return a relative path
    const relativePath = filepath.replace('./uploads/', '');
    return `/uploads/${relativePath}`;
  }
}
