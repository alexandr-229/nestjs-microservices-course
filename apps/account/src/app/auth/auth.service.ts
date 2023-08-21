import { Injectable } from '@nestjs/common';
import { RegisterDto } from './auth.controller';
import { UserRepository } from '../user/repositories/user.repository';
import { UserEntity } from '../user/entities/user.entity';
import { UserRole } from '@code/interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JwtService,
	) {}

	async register({ email, password, displayName }: RegisterDto) {
		const oldUser = await this.userRepository.findUser(email);
		if (oldUser) {
			throw new Error('User already exists');
		}
		const user = new UserEntity({
			displayName,
			email,
			role: UserRole.Student,
			passwordHash: '',
		});
		await user.setPassword(password);
		const newUser = await this.userRepository.createUser(user);
		return { email: newUser.email };
	}

	async validateUser(email: string, password: string) {
		const user = await this.userRepository.findUser(email);
		if (!user) {
			throw new Error('User not found');
		}
		const userEntity = new UserEntity(user);
		const correctPassword = await userEntity.validatePassword(password);
		if (!correctPassword) {
			throw new Error('Password incorrect');
		}
		return { id: user._id };
	}

	async login(id: string) {
		const accessToken = await this.jwtService.signAsync({ id });
		return { access_token: accessToken };
	}
}
