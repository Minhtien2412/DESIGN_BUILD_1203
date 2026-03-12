#!/usr/bin/env python3
f='/var/www/baotienweb-api/dist/chat/dto/create-room.dto.js'
with open(f) as fh: c=fh.read()

old = """(0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateRoomDto.prototype, "projectId", void 0);"""

new = """(0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateRoomDto.prototype, "projectId", void 0);"""

if old in c:
    c = c.replace(old, new)
    with open(f,'w') as fh: fh.write(c)
    print('FIXED: projectId IsNotEmpty -> IsOptional')
else:
    print('Pattern not found!')
    print(c)
