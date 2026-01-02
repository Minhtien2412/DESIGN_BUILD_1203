import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';

class PhaseOrder {
  @IsInt()
  id: number;

  @IsInt()
  order: number;
}

export class ReorderPhasesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhaseOrder)
  phaseOrders: PhaseOrder[];
}
