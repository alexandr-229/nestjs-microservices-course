import { AccountBuyCheckPayment, AccountBuyCourse, AccountChnageProfile } from '@code/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { BuyCourseSaga } from './sagas/buy.course.saga';

@Controller()
export class UserCommands {
	constructor (
		private readonly userRepository: UserRepository,
		private readonly rmqService: RMQService,
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

	@RMQValidate()
	@RMQRoute(AccountBuyCourse.topic)
	async buyCourse(@Body() { userId, courseId }: AccountBuyCourse.Request): Promise<AccountBuyCourse.Response> {
		const existedUser = await this.userRepository.findUserById(userId);
		if (!existedUser) {
			throw new Error('User not found');
		}
		const userEntity = new UserEntity(existedUser);
		const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
		const { user, paymentLink } = await saga.getState().pay();
		await this.userRepository.updateUserById(user._id, user);

		return { paymentLink };
	}

	@RMQValidate()
	@RMQRoute(AccountBuyCheckPayment.topic)
	async checkPayment(@Body() { userId, courseId }: AccountBuyCheckPayment.Request): Promise<AccountBuyCheckPayment.Response> {
		const existedUser = await this.userRepository.findUserById(userId);
		if (!existedUser) {
			throw new Error('User not found');
		}
		const userEntity = new UserEntity(existedUser);
		const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
		const { user, status } = await saga.getState().checkPayment();
		await this.userRepository.updateUserById(userId, user);
		
		return { status };
	}
};
