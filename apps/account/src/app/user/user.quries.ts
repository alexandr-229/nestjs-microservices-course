import { AccoutnUserInfo, AccoutnUserCourses } from '@code/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute } from 'nestjs-rmq';
import { UserRepository } from './repositories/user.repository';
import { UserEntity } from './entities/user.entity';

@Controller()
export class UserQueries {
	constructor(
		private readonly userRepository: UserRepository,
	) {}

	@RMQValidate()
	@RMQRoute(AccoutnUserInfo.topic)
	async userInfo(@Body() { id }: AccoutnUserInfo.Request): Promise<AccoutnUserInfo.Response> {
		const user = await this.userRepository.findUserById(id);
		const userEntity = new UserEntity(user);
		const profile = userEntity.getPublicProfile();
		return { profile };
	}

	@RMQValidate()
	@RMQRoute(AccoutnUserCourses.topic)
	async userCourses(@Body() { id }: AccoutnUserCourses.Request): Promise<AccoutnUserCourses.Response> {
		const { courses } = await this.userRepository.findUserById(id);
		return { courses };
	}
};
