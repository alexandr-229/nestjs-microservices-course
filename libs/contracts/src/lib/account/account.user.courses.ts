import { IsString } from 'class-validator';
import { IUserCourses } from '@code/interfaces';

export namespace AccoutnUserCourses {
	export const topic = 'account.user-info.query';

	export class Request {
		@IsString()
		id: string
	}

	export class Response {
		courses: IUserCourses[];
	}
}