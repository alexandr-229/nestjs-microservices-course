import { ConfigService, ConfigModule } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';

export const getMongoConfig = (): MongooseModuleAsyncOptions => ({
	inject: [ConfigService],
	imports: [ConfigModule],
	useFactory: (configService: ConfigService) => ({
		uri: getMongoString(configService),
	}),
});

const getMongoString = (configService: ConfigService): string =>
	'mongodb://'
	+ configService.get('MONGO_LOGIN')
	+ ':'
	+ configService.get('MONGO_PASSWORD')
	+ '@'
	+ configService.get('MONGO_HOST')
	+ ':'
	+ configService.get('MONGO_PORT')
	+ '/'
	+ configService.get('MONGO_DATABASE');
