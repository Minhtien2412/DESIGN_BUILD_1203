import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ServiceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, ServiceQueryDto, UpdateServiceDto } from './dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ServiceQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.ServiceWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = category;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service #${id} not found`);
    }

    // Increment view count
    await this.prisma.service.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return service;
  }

  async create(dto: CreateServiceDto, userId: number) {
    return this.prisma.service.create({
      data: {
        ...dto,
        createdBy: userId,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async update(id: number, dto: UpdateServiceDto, userId: number) {
    const service = await this.prisma.service.findUnique({ where: { id } });

    if (!service) {
      throw new NotFoundException(`Service #${id} not found`);
    }

    // Check ownership (hoặc kiểm tra admin role)
    // if (service.createdBy !== userId) {
    //   throw new ForbiddenException('You can only update your own services');
    // }

    return this.prisma.service.update({
      where: { id },
      data: dto,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async remove(id: number, userId: number) {
    const service = await this.prisma.service.findUnique({ where: { id } });

    if (!service) {
      throw new NotFoundException(`Service #${id} not found`);
    }

    // Check ownership
    // if (service.createdBy !== userId) {
    //   throw new ForbiddenException('You can only delete your own services');
    // }

    await this.prisma.service.delete({ where: { id } });
    return { message: 'Service deleted successfully' };
  }

  async toggleStatus(id: number, userId: number) {
    const service = await this.prisma.service.findUnique({ where: { id } });

    if (!service) {
      throw new NotFoundException(`Service #${id} not found`);
    }

    const newStatus = service.status === ServiceStatus.ACTIVE
      ? ServiceStatus.INACTIVE
      : ServiceStatus.ACTIVE;

    return this.prisma.service.update({
      where: { id },
      data: { status: newStatus },
    });
  }
}
