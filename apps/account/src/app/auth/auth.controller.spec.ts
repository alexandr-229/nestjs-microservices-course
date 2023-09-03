import { TestingModule, Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth.module';
import { getMongoConfig } from '../configs/mongo.config';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import { AccountLogin, AccountRegister } from '@code/contracts';

const authLogin: AccountLogin.Request = {
	email: 'b@gmail.com',
	password: '1',
}

const authRegister: AccountRegister.Request = {
	...authLogin,
	displayName: 'Name 1'
}

describe('Auth controller', () => {
	let app: INestApplication;
	let userRepository: UserRepository;
	let rmqService: RMQTestService;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				UserModule,
				AuthModule,
				ConfigModule.forRoot({
					isGlobal: true,
					envFilePath: 'envs/.account.env',
				}),
				RMQModule.forTest({}),
				MongooseModule.forRootAsync(getMongoConfig()),
			]
		}).compile();

		app = module.createNestApplication();
		userRepository = app.get<UserRepository>(UserRepository);
		rmqService = app.get(RMQService);

		await app.init();
	});

	it('register', async () => {
		const { email } = await rmqService.triggerRoute<AccountRegister.Request, AccountRegister.Response>(
			AccountRegister.topic,
			authRegister,
		);
		expect(email).toEqual(authRegister.email);
	});

	it('login', async () => {
		const { access_token } = await rmqService.triggerRoute<AccountLogin.Request, AccountLogin.Response>(
			AccountLogin.topic,
			authLogin,
		);
		expect(access_token).toBeDefined();
	});

	afterAll(async () => {
		await userRepository.deleteUser(authRegister.email);
		await app.close();
	});
});
