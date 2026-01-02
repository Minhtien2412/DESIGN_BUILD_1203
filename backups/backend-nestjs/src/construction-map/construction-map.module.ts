import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstructionMapController } from './construction-map.controller';
import { ConstructionMapGateway } from './construction-map.gateway';
import { ConstructionMapService } from './construction-map.service';
import { Link } from './entities/link.entity';
import { MapState } from './entities/map-state.entity';
import { Stage } from './entities/stage.entity';
import { Task } from './entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Stage, Link, MapState]),
  ],
  controllers: [ConstructionMapController],
  providers: [ConstructionMapService, ConstructionMapGateway],
  exports: [ConstructionMapService],
})
export class ConstructionMapModule {}
