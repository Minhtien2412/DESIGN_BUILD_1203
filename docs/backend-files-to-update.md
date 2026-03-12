# 📝 Backend Files to Update

## 🗂️ Files cần sửa trên server BE-baotienweb.cloud

### 1. DTOs (Data Transfer Objects)

#### `src/auth/dto/register.dto.ts`
```typescript
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @IsOptional()
  address?: string;
}

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  // ✅ NEW: Phone field
  @IsString()
  @IsOptional()
  phone?: string;

  // ✅ NEW: Location object
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}
```

---

### 2. Entities (Database Models)

#### `src/users/entities/user.entity.ts`
```typescript
import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ 
    type: 'enum', 
    enum: ['CLIENT', 'ENGINEER', 'ADMIN'],
    default: 'CLIENT' 
  })
  role: 'CLIENT' | 'ENGINEER' | 'ADMIN';

  @Column({ default: true })
  isActive: boolean;

  // ✅ NEW FIELDS
  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 8, 
    nullable: true,
    name: 'location_latitude'
  })
  locationLatitude: number;

  @Column({ 
    type: 'decimal', 
    precision: 11, 
    scale: 8, 
    nullable: true,
    name: 'location_longitude'
  })
  locationLongitude: number;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'location_address'
  })
  locationAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual getter for location object
  getLocation() {
    if (!this.locationLatitude || !this.locationLongitude) {
      return null;
    }
    return {
      latitude: this.locationLatitude,
      longitude: this.locationLongitude,
      address: this.locationAddress,
    };
  }
}
```

---

### 3. Services (Business Logic)

#### `src/auth/auth.service.ts`
```typescript
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, phone, location } = registerDto;

    // Check if user exists
    const existingUser = await this.usersRepository.findOne({ 
      where: { email } 
    });
    
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with new fields
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
      phone: phone || null,  // ✅ NEW
      locationLatitude: location?.latitude || null,  // ✅ NEW
      locationLongitude: location?.longitude || null,  // ✅ NEW
      locationAddress: location?.address || null,  // ✅ NEW
    });

    const savedUser = await this.usersRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    // Return response with location
    return {
      ...tokens,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        phone: savedUser.phone,  // ✅ NEW
        role: savedUser.role,
        isActive: savedUser.isActive,
        location: savedUser.getLocation(),  // ✅ NEW - use virtual getter
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.usersRepository.findOne({ 
      where: { email } 
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,  // ✅ NEW
        role: user.role,
        isActive: user.isActive,
        location: user.getLocation(),  // ✅ NEW
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.usersRepository.findOne({ 
      where: { id: userId } 
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,  // ✅ NEW
      role: user.role,
      isActive: user.isActive,
      location: user.getLocation(),  // ✅ NEW
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async generateTokens(user: User) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return { accessToken, refreshToken };
  }
}
```

---

### 4. Controllers (API Endpoints)

#### `src/auth/auth.controller.ts`
```typescript
import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    // Implement refresh token logic
    return { accessToken: 'new-token' };
  }
}
```

---

## 🔧 Deployment Steps

### 1. SSH vào server
```bash
ssh root@baotienweb.cloud
# hoặc
ssh -i ~/.ssh/id_rsa user@103.200.20.100
```

### 2. Backup database
```bash
cd /var/www/BE-baotienweb.cloud
mysqldump -u root -p construction_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 3. Run migration
```bash
mysql -u root -p construction_db < migration-add-user-fields.sql
```

### 4. Update backend code
```bash
# Upload updated files via SFTP/SCP
scp register.dto.ts root@baotienweb.cloud:/var/www/BE-baotienweb.cloud/src/auth/dto/
scp user.entity.ts root@baotienweb.cloud:/var/www/BE-baotienweb.cloud/src/users/entities/
scp auth.service.ts root@baotienweb.cloud:/var/www/BE-baotienweb.cloud/src/auth/
```

### 5. Rebuild & restart
```bash
cd /var/www/BE-baotienweb.cloud
npm run build
pm2 restart construction-api
pm2 logs construction-api --lines 100
```

### 6. Test API
```bash
# Test register with phone & location
curl -X POST https://baotienweb.cloud/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "name": "Test User",
    "phone": "0912345678",
    "location": {
      "latitude": 10.7769,
      "longitude": 106.7009,
      "address": "123 Nguyen Van Linh, Q7, TP.HCM"
    }
  }'
```

---

## ✅ Verification Checklist

- [ ] Database migration completed without errors
- [ ] New columns visible in `users` table
- [ ] Backend code updated and compiled
- [ ] PM2 service restarted successfully
- [ ] Registration API accepts phone & location
- [ ] Login API returns phone & location
- [ ] Profile API shows phone & location
- [ ] Frontend receives complete user object

---

## 🐛 Troubleshooting

### Error: "property phone should not exist"
- Chưa update RegisterDto
- Rebuild backend: `npm run build`

### Error: "Unknown column 'phone'"
- Migration chưa chạy
- Check: `DESCRIBE users;`

### PM2 restart fails
- Check logs: `pm2 logs construction-api`
- Check syntax: `npm run build`

### Frontend không nhận được phone/location
- Check API response: `curl .../auth/login`
- Verify AuthContext mapUser()
