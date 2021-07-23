import { Client } from 'pg';
import joi from 'joi';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SQSClient, DeleteMessageCommand, SendMessageCommand } from '@aws-sdk/client-sqs';

const { PG_HOST, PG_PORT, PG_DBNAME, PG_USERNAME, PG_PASSWORD, SNS_ARN, SQS_URL, DLQ_URL } = process.env;

const snsClient = new SNSClient({ region: 'eu-west-1' });
const sqsClient = new SQSClient({ region: 'eu-west-1' });

const dbOptions = {
  user: PG_USERNAME,
  host: PG_HOST,
  database: PG_DBNAME,
  password: PG_PASSWORD,
  port: PG_PORT,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000
};

const ProductSchema = joi.object({
  title: joi.string().required(),
  description: joi.string().required(),
  price: joi.number().required(),
  count: joi.number().required()
});

const catalogBatchProcess = async (event) => {
  const messages = {
    success: [],
    failure: []
  };

  const deleteMessageFromQueue = async (record) => {
    messages.success.push(record.body);
    const params = {
      QueueUrl: SQS_URL,
      ReceiptHandle: record.receiptHandle
    };
    return await sqsClient.send(new DeleteMessageCommand(params));
  };

  const sendMessageToDLQ = async (record) => {
    messages.failure.push(record.body);
    const params = {
      QueueUrl: DLQ_URL,
      MessageBody: record.body
    };
    return await sqsClient.send(new SendMessageCommand(params));
  };

  const client = new Client(dbOptions);

  try {
    console.log('catalogBatchProcess event: ', event);
    console.log('catalogBatchProcess event.Records: ', event.Records);

    await client.connect();

    for (const record of event.Records) {
      console.log('record = ', record);
      
      let product;
      try {
        product = JSON.parse(record.body);
      } catch (e) {
        // product is invalid. need to send this message to Dead Letter Queue
        console.log('record.body parse error; sendMessageToDLQ');
        // messages.failure.push(record.body);
        const res = await sendMessageToDLQ(record);
        console.log('sendMessageToDLQ res = ', res);
        // go to the next message
        continue;
      }
      
      console.log('product = ', product);
      
      // validate product
      const productValidated =  ProductSchema.validate(product);
      console.log('productValidated = ', productValidated);
      if (productValidated.error) {
        // product is invalid. need to send this message to Dead Letter Queue
        console.log('product validation error; sendMessageToDLQ');
        // messages.failure.push(record.body);
        const res = await sendMessageToDLQ(record);
        console.log('sendMessageToDLQ res = ', res);
        // go to the next message
        continue;
      }

      try {
        await client.query('BEGIN');
        const fillProductsQuery = {
          text: 'INSERT INTO products (title, description, price) VALUES ($1, $2, $3) RETURNING id',
          values: [productValidated.value.title, productValidated.value.description, productValidated.value.price]
        };
        const fillProductsResult = await client.query(fillProductsQuery);
        console.log('fillProductsResult = ', fillProductsResult);

        const id = fillProductsResult.rows[0].id;
        const fillStocksQuery = {
          text: 'INSERT INTO stocks (product_id, count) VALUES ($1, $2)',
          values: [id, productValidated.value.count]
        };
        const fillStocksResult = await client.query(fillStocksQuery);
        console.log('fillStocksResult = ', fillStocksResult);
        await client.query('COMMIT');

        // when record has written to DB - need to delete message from queue
        // because it could be send back if error occcurs
        console.log('product has been written to DB; deleteMessageFromQueue');
        // messages.success.push(record.body);
        const res = await deleteMessageFromQueue(record);
        console.log('deleteMessageFromQueue res = ', res);
      } catch (e) {
        await client.query('ROLLBACK');
        // when record has not beed written to DB - need to send this message to Dead Letter Queue
        console.log('product has not been written to DB; ROLLBACK query AND sendMessageToDLQ');
        const res = await sendMessageToDLQ(record);
        // messages.failure.push(record.body);
        console.log('sendMessageToDLQ res = ', res);
      }
    }

    const snsMessageText = `
Successfull messages:
\n
${messages.success.join(',\n')}
\n\n
Failed messages:
\n
${messages.failure.join(',\n')}
`;

    console.log('snsMessageText = ', snsMessageText);
    const snsMessageParams = {
      Subject: 'catalogBatchProcess notification',
      Message: snsMessageText,
      TopicArn: SNS_ARN
    };

    const snsResult = await snsClient.send(new PublishCommand(snsMessageParams));
    console.log('snsResult = ', snsResult);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: 'catalogBatchProcess done'
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({message: 'Internal server error'})
    };
  } finally {
    client.end();
  }
};

export default catalogBatchProcess;
