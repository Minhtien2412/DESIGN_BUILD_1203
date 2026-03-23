import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 8088;
  const logger = new Logger("Bootstrap");

  // Only listen on all interfaces — firewall restricts to tailscale0
  await app.listen(port, "0.0.0.0");
  logger.log(`AI Brain listening on port ${port}`);
}
bootstrap();
