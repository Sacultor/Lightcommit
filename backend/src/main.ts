import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  app.setGlobalPrefix('api');
  
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${configService.get('nodeEnv')}`);
}

bootstrap();

