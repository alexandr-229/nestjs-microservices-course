import { PurchaseState } from '@code/interfaces';
import { IsString } from 'class-validator';

export namespace AccountChnageCourse {
	export const topic = 'account.changed-course.event';

	export class Request {
		@IsString()
		userId: string;

		@IsString()
		courseId: string;

		@IsString()
		status: PurchaseState;
	}
}
