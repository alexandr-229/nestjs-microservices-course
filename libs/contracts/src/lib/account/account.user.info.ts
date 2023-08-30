import { IsString } from 'class-validator';
import { IUser } from '@code/interfaces';

export namespace AccoutnUserInfo {
	export const topic = 'account.user-info.query';

	export class Request {
		@IsString()
		id: string
	}

	export class Response {
		user: Omit<IUser, 'passwordHash'>;
	}
}