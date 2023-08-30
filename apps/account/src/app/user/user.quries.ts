import { AccoutnUserInfo, AccoutnUserCourses } from '@code/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute } from 'nestjs-rmq';
import { UserRepository } from './repositories/user.repository';

@Controller()
export class UserQueries {
	constructor(
		private readonly userRepository: UserRepository,
	) {}

	@RMQValidate()
	@RMQRoute(AccoutnUserInfo.topic)
	async userInfo(@Body() { id }: AccoutnUserInfo.Request): Promise<AccoutnUserInfo.Response> {
		const { passwordHash, ...user } = await this.userRepository.findUserById(id);
		return { user };
	}

	@RMQValidate()
	@RMQRoute(AccoutnUserCourses.topic)
	async userCourses(@Body() { id }: AccoutnUserCourses.Request): Promise<AccoutnUserCourses.Response> {
		const { courses } = await this.userRepository.findUserById(id);
		return { courses };
	}
};
