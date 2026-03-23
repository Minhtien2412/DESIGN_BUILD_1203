import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthMiddleware } from "./common/auth.middleware";
import { HealthModule } from "./health/health.module";
import { ModerationModule } from "./moderation/moderation.module";
import { OpenClawModule } from "./openclaw/openclaw.module";
import { PolicyModule } from "./policy/policy.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    PolicyModule,
    OpenClawModule,
    ModerationModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Protect all /internal/* routes with service token
    consumer.apply(AuthMiddleware).forRoutes("internal/*");
  }
}
