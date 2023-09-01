import { IUser } from '@code/interfaces';
import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { UserEntity } from './entities/user.entity';
import { AccountBuyCheckPayment, AccountBuyCourse, AccountChnageProfile } from '@code/contracts';
import { RMQService } from 'nestjs-rmq';
import { BuyCourseSaga } from './sagas/buy.course.saga';
import { UserEventEmitter } from './user.event.emitter';

@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly rmqService: RMQService,
		private readonly userEventEmitter: UserEventEmitter
	) {}

	async changeProfile({ displayName }: Pick<IUser, 'displayName'>, id: string): Promise<AccountChnageProfile.Response> {
		const user = await this.userRepository.findUserById(id);
		if (!user) {
			throw new Error('User not found')
		}
		const userEntity = new UserEntity(user);
		userEntity.changeProfile(displayName);
		const result = await this.updateUser(userEntity);
		return { id: result[1] };
	}

	async buyCourse(userId: string, courseId: string): Promise<AccountBuyCourse.Response> {
		const existedUser = await this.userRepository.findUserById(userId);
		if (!existedUser) {
			throw new Error('User not found');
		}
		const userEntity = new UserEntity(existedUser);
		const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
		const { user, paymentLink } = await saga.getState().pay();
		await this.updateUser(user);

		return { paymentLink };
	}

	async checkPayment(userId: string, courseId: string): Promise<AccountBuyCheckPayment.Response> {
		const existedUser = await this.userRepository.findUserById(userId);
		if (!existedUser) {
			throw new Error('User not found');
		}
		const userEntity = new UserEntity(existedUser);
		const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
		const { user, status } = await saga.getState().checkPayment();
		await this.updateUser(user);
		
		return { status };
	}

	private updateUser(user: UserEntity) {
		return Promise.all([
			this.userEventEmitter.handle(user),
			this.userRepository.updateUserById(user._id, user),
		]);
	}
};
