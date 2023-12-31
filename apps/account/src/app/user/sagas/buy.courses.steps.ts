import { CourseGetCourse, PaymentCheck, PaymentGenerateLink, PaymentStatus } from '@code/contracts';
import { UserEntity } from '../entities/user.entity';
import { BuyCourseSagaState } from './buy.course.state';
import { PurchaseState } from '@code/interfaces';

export class BuyCourseSagaStateStarted extends BuyCourseSagaState {
	public async pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
		const { course } = await this.saga.rmqService.send<CourseGetCourse.Request, CourseGetCourse.Response>(CourseGetCourse.topic, {
			id: this.saga.courseId
		});

		if (!course) {
			throw new Error('Course not found');
		}

		if (!course.price) {
			this.saga.setState(PurchaseState.Purchased, course._id);
			return { paymentLink: null, user: this.saga.user };
		}

		const { paymentLink } = await this.saga.rmqService.send<PaymentGenerateLink.Request, PaymentGenerateLink.Response>(PaymentGenerateLink.topic, {
			courseId: course._id,
			userId: this.saga.user._id,
			sum: course.price,
		});

		this.saga.setState(PurchaseState.WaitingForPayment, course._id);

		return { paymentLink, user: this.saga.user };
	}

	public checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus; }> {
		throw new Error('You can`t check the payment');
	}

	public async cancel(): Promise<{ user: UserEntity; }> {
		this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
		
		return { user: this.saga.user };
	}
}

export class BuyCourseSagaStateWaitingForPayment extends BuyCourseSagaState {
	public pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
		throw new Error('You can`t pay for this course.');
	}

	public async checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus; }> {
		const { status } = await this.saga.rmqService.send<PaymentCheck.Request, PaymentCheck.Response>(PaymentCheck.topic, {
			userId: this.saga.user._id,
			courseId: this.saga.courseId,
		});
		
		if (status === 'canceled') {
			this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
		}

		if (status === 'success') {
			this.saga.setState(PurchaseState.Purchased, this.saga.courseId);
		}
		
		return { user: this.saga.user, status };
	}

	public cancel(): Promise<{ user: UserEntity; }> {
		throw new Error('You can`t cancel a purchase.');
	}
}

export class BuyCourseSagaStatePurchased extends BuyCourseSagaState {
	public pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
		throw new Error('You can`t buy this course.');
	}
	public checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus; }> {
		throw new Error('You can`t check status of this course.');
	}
	public cancel(): Promise<{ user: UserEntity; }> {
		throw new Error('You can`t cancel.');
	}
}

export class BuyCourseSagaStateCanceled extends BuyCourseSagaState {
	public async pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
		this.saga.setState(PurchaseState.Started, this.saga.courseId);
		return this.saga.getState().pay();
	}
	public checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus; }> {
		throw new Error('You can`t check status of this course.');
	}
	public cancel(): Promise<{ user: UserEntity; }> {
		throw new Error('You can`t cancel.');
	}
}
