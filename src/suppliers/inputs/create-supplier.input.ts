import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsEmail } from 'class-validator';

@InputType()
export class CreateSupplierInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
