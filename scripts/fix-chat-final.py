#!/usr/bin/env python3
"""Fix chat service to use default project when projectId not provided"""

svc_path = '/var/www/baotienweb-api/dist/chat/chat.service.js'
with open(svc_path, 'r') as f:
    svc = f.read()

# Find the createRoom function and fix it to handle missing projectId
old = """    async createRoom(createRoomDto, userId) {
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

new = """    async createRoom(createRoomDto, userId) {
        const { projectId: inputProjectId, name } = createRoomDto;
        let memberCreates = [];
        // Use provided projectId or find/create a default project
        let finalProjectId = inputProjectId;
        if (!finalProjectId) {
            // Find first available project not already linked to a chat room
            const existingRoomProjectIds = (await this.prisma.chatRoom.findMany({ select: { projectId: true } })).map(r => r.projectId);
            const availableProject = await this.prisma.project.findFirst({
                where: { id: { notIn: existingRoomProjectIds } },
                select: { id: true },
            });
            if (availableProject) {
                finalProjectId = availableProject.id;
            } else {
                // Create a new project for this chat room
                const newProject = await this.prisma.project.create({
                    data: { title: 'Chat: ' + name, description: 'Auto-created for chat room', status: 'IN_PROGRESS' },
                });
                finalProjectId = newProject.id;
            }
        }
        // Kiểm tra project
        if (finalProjectId) {
            const project = await this.prisma.project.findUnique({
                where: { id: finalProjectId },
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
                projectId: finalProjectId,
                members: {
                    create: memberCreates,
                },
            },"""

if old in svc:
    svc = svc.replace(old, new, 1)
    with open(svc_path, 'w') as f:
        f.write(svc)
    print('FIXED: Chat service now auto-creates projects when projectId missing')
else:
    print('Pattern not found!')
    # Show current createRoom
    import re
    match = re.search(r'async createRoom.*?const room = await this\.prisma\.chatRoom\.create', svc, re.DOTALL)
    if match:
        print('Current code:')
        print(match.group(0)[:500])
