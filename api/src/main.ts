import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  //set global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  //enable cors

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? 'https://localhost:3000',
    credentials: true,
    method: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  //enable swagger
  const config = new DocumentBuilder()
    .setTitle('Api Documantation')
    .setDescription('Api Documantation for the app')
    .setVersion('1.0')
    .addTag('auth', 'Authenticated Related endpoints')
    .addTag('user', 'User managment endpoints')
    .addTag('products', 'Products managment endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Refresh-JWT',
        in: 'header',
      },
      'JWT-refresh',
    )
    .addServer('http://localhost:3001', 'Development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Api Documantation',
    customfavIcon:
      'https://swagger.io/wp-content/uploads/2021/02/swagger_logo.png',
    customCss: `
      .swagger-ui .topbar{display:none}
      .swagger-ui .info{margin:50px 0}
      `,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  Logger.error('Error starting server', err);
  process.exit(1);
});
