import amqp from 'amqplib/callback_api';
import {
  sendOtp,
  verifyOtpForRegistration,
} from '../controllers/authController';
import logger from '../logger';
import { Request } from 'express';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

export interface CustomRequest extends Request {
  body: any;
}

export interface CustomResponse {
  status: (statusCode: number) => CustomResponse;
  json: (body: any) => CustomResponse;
}

export const startConsumer = () => {
  amqp.connect(RABBITMQ_URL, (error0, connection) => {
    if (error0) {
      logger.error(`RabbitMQ connection error: ${error0.message}`);
      throw error0;
    }

    connection.createChannel((error1, channel) => {
      if (error1) {
        logger.error(`RabbitMQ channel creation error: ${error1.message}`);
        throw error1;
      }

      logger.info('RabbitMQ Connected');

      const queue = 'auth_operations';

      channel.assertQueue(queue, { durable: true });

      channel.consume(
        queue,
        async (msg) => {
          if (msg !== null) {
            const messageContent = JSON.parse(msg.content.toString());
            const { correlationId, replyTo } = msg.properties;

            try {
              const customResponse: CustomResponse = {
                status: (statusCode: number) => customResponse,
                json: (body: any) => {
                  logger.info(`Response body: ${JSON.stringify(body)}`);
                  // Send response back to the replyTo queue
                  if (replyTo) {
                    channel.sendToQueue(
                      replyTo,
                      Buffer.from(JSON.stringify(body)),
                      {
                        correlationId,
                      }
                    );
                  }
                  return customResponse;
                },
              };

              switch (messageContent.operation) {
                case 'send_otp':
                  await sendOtp(
                    { body: messageContent.data } as CustomRequest,
                    customResponse
                  );
                  break;
                case 'verify_otp':
                  await verifyOtpForRegistration(
                    { body: messageContent.data } as CustomRequest,
                    customResponse
                  );
                  break;
                default:
                  logger.error(
                    `Unknown operation: ${messageContent.operation}`
                  );
                  break;
              }

              logger.info(
                `Processed message: ${JSON.stringify(messageContent)}`
              );
            } catch (error) {
              logger.error(`Error processing message: ${error}`);
            }

            channel.ack(msg);
          }
        },
        { noAck: false }
      );
    });
  });
};
