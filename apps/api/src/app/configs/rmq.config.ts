import { ConfigModule, ConfigService } from '@nestjs/config';
import { IRMQServiceAsyncOptions } from 'nestjs-rmq';

export const getRMQConfig = (): IRMQServiceAsyncOptions => ({
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (configService: ConfigService) => ({
		exchangeName: configService.get('AMQP_EXCHANGE') || '',
		prefetchCount: 12,
		serviceName: 'account',
		connections: [
			{
				login: configService.get('AMQP_USER') || '',
				password: configService.get('AMQP_PASSWORD') || '',
				host: configService.get('AMQP_HOSTNAME') || '',
			}
		]
	}),
});
