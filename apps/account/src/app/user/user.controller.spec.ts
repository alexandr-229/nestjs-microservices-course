import { TestingModule, Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { getMongoConfig } from '../configs/mongo.config';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { AccountBuyCheckPayment, AccountBuyCourse, AccountLogin, AccountRegister, AccoutnUserInfo, CourseGetCourse, PaymentCheck, PaymentGenerateLink } from '@code/contracts';
import { verify } from 'jsonwebtoken';

const authLogin: AccountLogin.Request = {
	email: 'a@gmail.com',
	password: '1',
}

const authRegister: AccountRegister.Request = {
	...authLogin,
	displayName: 'Name 1'
}

const courseId = 'courseId';
const expectedStatus = 'success';

describe('Auth controller', () => {
	let app: INestApplication;
	let userRepository: UserRepository;
	let rmqService: RMQTestService;
	let token: string;
	let configService: ConfigService;
	let userId: string;

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
		configService = app.get(ConfigService);

		await app.init();

		await rmqService.triggerRoute<AccountRegister.Request, AccountRegister.Response>(
			AccountRegister.topic,
			authRegister,
		);

		const { access_token } = await rmqService.triggerRoute<AccountLogin.Request, AccountLogin.Response>(
			AccountLogin.topic,
			authLogin,
		);

		token = access_token;

		const data = verify(token, configService.get('JWT_SECRET'));
		userId = data['id'];
	});

	it('AccountUserInfo', async () => {
		const { profile: { displayName } } = await rmqService.triggerRoute<AccoutnUserInfo.Request, AccoutnUserInfo.Response>(AccoutnUserInfo.topic, {
			id: userId,
		});
		expect(displayName).toEqual(authRegister.displayName);
	});

	it('BuyCourse', async () => {
		const paymentLink = 'paymentLink';
		rmqService.mockReply<CourseGetCourse.Response>(CourseGetCourse.topic, {
			course: {
				_id: courseId,
				price: 100,
			},
		});
		rmqService.mockReply<PaymentGenerateLink.Response>(PaymentGenerateLink.topic, {
			paymentLink,
		});
		const result = await rmqService.triggerRoute<AccountBuyCourse.Request, AccountBuyCourse.Response>(AccountBuyCourse.topic, {
			userId,
			courseId,
		});
		expect(result.paymentLink).toBe(paymentLink);
		await expect(
			rmqService.triggerRoute<AccountBuyCourse.Request, AccountBuyCourse.Response>(AccountBuyCourse.topic, {
				userId,
				courseId,
			})
		).rejects.toThrowError();
	});

	it('Check Payment', async () => {
		rmqService.mockReply<PaymentCheck.Response>(PaymentCheck.topic, {
			status: 'success',
		});
		const { status } = await rmqService.triggerRoute<AccountBuyCheckPayment.Request, AccountBuyCheckPayment.Response>(AccountBuyCheckPayment.topic, {
			userId,
			courseId,
		});
		expect(status).toBe(expectedStatus);
	});

	afterAll(async () => {
		await userRepository.deleteUser(authRegister.email);
		await app.close();
	});
});
