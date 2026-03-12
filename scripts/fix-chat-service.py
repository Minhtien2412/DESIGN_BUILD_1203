#!/usr/bin/env python3
"""
Fix backend issues:
1. Chat service: make projectId optional - allow room creation without project
2. Chat DTO: make projectId optional
"""
import re

# ===== FIX 1: Chat DTO - make projectId optional =====
dto_path = '/var/www/baotienweb-api/dist/chat/dto/create-room.dto.js'
with open(dto_path, 'r') as f:
    dto = f.read()

# Change IsNotEmpty to IsOptional for projectId
# The compiled DTO has decorators like: __decorate([IsInt, IsNotEmpty, __metadata("design:type", Number)], ...)
# We need to add IsOptional and remove IsNotEmpty for projectId
if 'IsNotEmpty' in dto and 'projectId' in dto:
    # Replace IsNotEmpty on projectId with IsOptional
    # Pattern: the decorators are applied to prototype properties
    # Just remove @IsNotEmpty on projectId and add @IsOptional
    old = '(0, class_validator_1.IsNotEmpty)()'
    # Keep it but also add IsOptional... actually easier to just replace the whole DTO
    pass

print(f'DTO file: {dto_path}')
print(dto[:500])
print('---')

# ===== FIX 2: Chat Service - make projectId optional =====
svc_path = '/var/www/baotienweb-api/dist/chat/chat.service.js'
with open(svc_path, 'r') as f:
    svc = f.read()

# Replace the createRoom function to make projectId optional
old_create = """    async createRoom(createRoomDto, userId) {
        const { projectId, name } = createRoomDto;
        // Kiểm tra project tồn tại
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { client: true, engineer: true },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project với ID ${projectId} không tồn tại`);
        }
        // Tạo chat room
        const room = await this.prisma.chatRoom.create({
            data: {
                name,
                projectId,
                members: {
                    create: [
                        ...(project.clientId ? [{ userId: project.clientId }] : []),
                        ...(project.engineerId ? [{ userId: project.engineerId }] : []),
                    ],
                },
            },"""

new_create = """    async createRoom(createRoomDto, userId) {
        const { projectId, name } = createRoomDto;
        let memberCreates = [];
        // Kiểm tra project nếu có projectId
        if (projectId) {
            const project = await this.prisma.project.findUnique({
                where: { id: projectId },
                include: { client: true, engineer: true },
            });
            if (project) {
                if (project.clientId) memberCreates.push({ userId: project.clientId });
                if (project.engineerId) memberCreates.push({ userId: project.engineerId });
            }
        }
        // Luôn thêm user hiện tại
        if (userId && !memberCreates.find(m => m.userId === userId)) {
            memberCreates.push({ userId: userId });
        }
        // Tạo chat room
        const room = await this.prisma.chatRoom.create({
            data: {
                name,
                ...(projectId ? { projectId } : {}),
                members: {
                    create: memberCreates,
                },
            },"""

if old_create in svc:
    svc = svc.replace(old_create, new_create, 1)
    with open(svc_path, 'w') as f:
        f.write(svc)
    print('[FIX] Chat service: made projectId optional in createRoom')
else:
    print('[SKIP] Chat service createRoom pattern not found')
    # Try partial match
    lines = svc.split('\n')
    for i, line in enumerate(lines):
        if 'createRoom(createRoomDto' in line:
            print(f'  Found createRoom at line {i+1}: {line.strip()}')
        if 'Project v' in line:
            print(f'  Found project check at line {i+1}: {line.strip()}')

# ===== FIX 3: Chat DTO - make projectId optional =====
with open(dto_path, 'r') as f:
    dto = f.read()

# Add IsOptional import if not present
if 'IsOptional' not in dto:
    dto = dto.replace(
        'const class_validator_1 = require("class-validator");',
        'const class_validator_1 = require("class-validator"); // includes IsOptional'
    )

# The DTO decorators look like:
# __decorate([(0, class_validator_1.IsInt)(), (0, class_validator_1.IsNotEmpty)(), ...], CreateRoomDto.prototype, "projectId", void 0);
# Change to: __decorate([(0, class_validator_1.IsInt)(), (0, class_validator_1.IsOptional)(), ...], CreateRoomDto.prototype, "projectId", void 0);
dto = re.sub(
    r'\(0, class_validator_1\.IsNotEmpty\)\(\)(.*?"projectId")',
    r'(0, class_validator_1.IsOptional)()\1',
    dto
)

with open(dto_path, 'w') as f:
    f.write(dto)
print('[FIX] Chat DTO: made projectId optional (IsNotEmpty -> IsOptional)')

# Verify
with open(dto_path, 'r') as f:
    print('\nDTO after fix:')
    print(f.read()[:500])
