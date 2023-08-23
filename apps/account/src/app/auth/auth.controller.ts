import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountLogin, AccountRegister } from '@code/contracts';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
	) {}

	@Post('register')
	async register(@Body() dto: AccountRegister.Request): Promise<AccountRegister.Response> {
		const result = await this.authService.register(dto);
		return result;
	}

	@HttpCode(200)
	@Post('login')
	async login(@Body() dto: AccountLogin.Request): Promise<AccountLogin.Response> {
		const { id } = await this.authService.validateUser(dto.email, dto.password);
		const result = await this.authService.login(id);
		return result;
	}
}
