import { IsString } from 'class-validator';
import { PaymentStatus } from '../payment/payment.check';

export namespace AccountBuyCheckPayment {
	export const topic = 'account.check-payment.query';

	export class Request {
		@IsString()
		userId: string;

		@IsString()
		courseId: string;
	}

	export class Response {
		status: PaymentStatus;
	}
};
