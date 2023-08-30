import { IsOptional, IsString } from 'class-validator';

export namespace AccountChnageProfile {
	export const topic = 'account.chnage-profile.command';

	export class Request {
		@IsString()
		id: string
		
		@IsOptional()
		@IsString()
		displayName?: string;
	}

	export class Response {
		id: string;
	}
}
