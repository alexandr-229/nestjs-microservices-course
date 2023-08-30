import { AccountChnageProfile } from '@code/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Controller()
export class UserCommands {
	constructor (
		private readonly userRepository: UserRepository,
	) {}

	@RMQValidate()
	@RMQRoute(AccountChnageProfile.topic)
	async changeProfile(@Body() { id, displayName }: AccountChnageProfile.Request): Promise<AccountChnageProfile.Response> {
		const user = await this.userRepository.findUserById(id);
		if (!user) {
			throw new Error('User not found')
		}
		const userEntity = new UserEntity(user);
		userEntity.changeProfile(displayName);
		const result: string = await this.userRepository.updateUserById(id, userEntity);
		return { id: result };
	}
};
