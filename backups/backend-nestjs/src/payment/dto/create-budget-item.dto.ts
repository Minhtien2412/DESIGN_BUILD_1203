import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBudgetItemDto {
  @IsInt()
  budgetId: number;

  @IsString()
  category: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  allocatedAmount: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;
}
