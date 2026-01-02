import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3001;
  const apiPrefix = configService.get('API_PREFIX') || 'api';

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  const corsOrigin = configService.get('CORS_ORIGIN')?.split(',') || ['*'];
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Global API prefix
  app.setGlobalPrefix(apiPrefix);

  await app.listen(port);
  console.log(`🚀 Construction Map API running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📡 WebSocket server will run on port: ${configService.get('WS_PORT') || 3002}`);
}

bootstrap();
