import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, ref: 'User' })
  owner: string; // ID del usuario propietario

  @Prop({ type: [{ type: String, ref: 'User' }], default: [] })
  members: string[]; // IDs de usuarios miembros

  @Prop({ default: 0 })
  maxMembers: number; // Límite de miembros (0 = ilimitado)
}

export const CompanySchema = SchemaFactory.createForClass(Company);
