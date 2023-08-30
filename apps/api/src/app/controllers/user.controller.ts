import { Controller, Post, UseGuards } from '@nestjs/common';
import { JWTAuthQuard } from '../guards/jwt.guard';
import { UserId } from '../guards/user.decorator';

@Controller('user')
export class UserController {
	constructor() {}

	@UseGuards(JWTAuthQuard)
	@Post('info')
	async info(@UserId() id: string) {
		
	}
}
