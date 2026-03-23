import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { OpenClawAdapter } from "./openclaw.adapter";

@Module({
  imports: [HttpModule],
  providers: [OpenClawAdapter],
  exports: [OpenClawAdapter],
})
export class OpenClawModule {}
