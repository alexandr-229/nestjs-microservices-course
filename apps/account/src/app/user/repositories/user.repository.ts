import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/user.model';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) {}

	async createUser(user: UserEntity) {
		const newUser = new this.userModel(user);
		return newUser.save();
	}

	async findUser(email: string) {
		const result = await this.userModel.findOne({ email }).exec();
		return result;
	}

	async findUserById(id: string) {
		const user = await this.userModel.findById(id).exec();
		const result = user.toJSON();
		return result;
	}

	async deleteUser(email: string) {
		await this.userModel.deleteOne({ email }).exec();
	}
}
