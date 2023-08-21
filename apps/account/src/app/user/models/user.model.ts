import { Document } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IUser, UserRole } from '@code/interfaces'

@Schema()
export class User extends Document implements IUser {
	@Prop()
	displayName?: string;

	@Prop({ required: true, unique: true })
	email: string;

	@Prop({ required: true })
	passwordHash: string;

	@Prop({ required: true, enum: UserRole, type: String, default: UserRole.Student })
	role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
