import { AccountBuyCheckPayment, AccountBuyCourse, AccountChnageProfile } from '@code/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { UserService } from './user.service';

@Controller()
export class UserCommands {
	constructor (
		private readonly userService: UserService,
	) {}

	@RMQValidate()
	@RMQRoute(AccountChnageProfile.topic)
	async changeProfile(@Body() { id, displayName }: AccountChnageProfile.Request): Promise<AccountChnageProfile.Response> {
		const result = await this.userService.changeProfile({ displayName }, id);
		return result;
	}

	@RMQValidate()
	@RMQRoute(AccountBuyCourse.topic)
	async buyCourse(@Body() { userId, courseId }: AccountBuyCourse.Request): Promise<AccountBuyCourse.Response> {
		const result = await this.userService.buyCourse(userId, courseId);
		return result;
	}

	@RMQValidate()
	@RMQRoute(AccountBuyCheckPayment.topic)
	async checkPayment(@Body() { userId, courseId }: AccountBuyCheckPayment.Request): Promise<AccountBuyCheckPayment.Response> {
		const result = await this.userService.checkPayment(userId, courseId);
		return result;
	}
};
