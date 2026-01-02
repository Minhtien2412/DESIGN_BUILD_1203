import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUtilityDto, UpdateUtilityDto, UtilityQueryDto } from './dto';

@Injectable()
export class UtilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: UtilityQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      enabled,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.UtilityWhereInput = {};

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by type
    if (type) {
      where.type = type;
    }

    // Filter by enabled status
    if (enabled !== undefined) {
      where.enabled = enabled;
    }

    const skip = (page - 1) * limit;
    const orderBy: Prisma.UtilityOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [data, total] = await Promise.all([
      this.prisma.utility.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.utility.count({ where }),
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
    const utility = await this.prisma.utility.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!utility) {
      throw new NotFoundException(`Utility with ID ${id} not found`);
    }

    // Increment view count
    await this.prisma.utility.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return utility;
  }

  async create(createUtilityDto: CreateUtilityDto, userId: number) {
    const utility = await this.prisma.utility.create({
      data: {
        ...createUtilityDto,
        createdBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return utility;
  }

  async update(id: number, updateUtilityDto: UpdateUtilityDto, userId: number) {
    // Check if utility exists
    const utility = await this.prisma.utility.findUnique({
      where: { id },
    });

    if (!utility) {
      throw new NotFoundException(`Utility with ID ${id} not found`);
    }

    // Optional: Check if user has permission to update
    // if (utility.createdBy !== userId && !user.isAdmin) {
    //   throw new ForbiddenException('You do not have permission to update this utility');
    // }

    const updated = await this.prisma.utility.update({
      where: { id },
      data: updateUtilityDto,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id: number, userId: number) {
    // Check if utility exists
    const utility = await this.prisma.utility.findUnique({
      where: { id },
    });

    if (!utility) {
      throw new NotFoundException(`Utility with ID ${id} not found`);
    }

    // Optional: Check if user has permission to delete
    // if (utility.createdBy !== userId && !user.isAdmin) {
    //   throw new ForbiddenException('You do not have permission to delete this utility');
    // }

    await this.prisma.utility.delete({
      where: { id },
    });

    return { message: 'Utility deleted successfully' };
  }

  async toggleEnabled(id: number, userId: number) {
    const utility = await this.prisma.utility.findUnique({
      where: { id },
    });

    if (!utility) {
      throw new NotFoundException(`Utility with ID ${id} not found`);
    }

    const updated = await this.prisma.utility.update({
      where: { id },
      data: {
        enabled: !utility.enabled,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async incrementUseCount(id: number) {
    const utility = await this.prisma.utility.findUnique({
      where: { id },
    });

    if (!utility) {
      throw new NotFoundException(`Utility with ID ${id} not found`);
    }

    await this.prisma.utility.update({
      where: { id },
      data: {
        useCount: { increment: 1 },
      },
    });

    return { message: 'Use count incremented successfully' };
  }
}
