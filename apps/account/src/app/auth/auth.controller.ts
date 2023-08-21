import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

export class RegisterDto {
	email: string;
	password: string;
	displayName?: string;
}

export class LoginDto {
	email: string;
	password: string;
}

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
	) {}

	@Post('register')
	async register(@Body() dto: RegisterDto) {
		const result = await this.authService.register(dto);
		return result;
	}

	@HttpCode(200)
	@Post('login')
	async login(@Body() dto: LoginDto) {
		const { id } = await this.authService.validateUser(dto.email, dto.password);
		const result = await this.authService.login(id);
		return result;
	}
}
