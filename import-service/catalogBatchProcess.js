import { Client } from 'pg';
import joi from 'joi';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const { PG_HOST, PG_PORT, PG_DBNAME, PG_USERNAME, PG_PASSWORD, SNS_ARN } = process.env;

const snsClient = new SNSClient({ region: 'eu-west-1' });

const options = {
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
  const client = new Client(options);
  try {
    console.log('catalogBatchProcess event: ', event);
    console.log('catalogBatchProcess event.Records: ', event.Records);

    const products = event.Records.map(item => JSON.parse(item.body));

    await client.connect();

    console.log('products = ', products);
    for (const product of products) {
      // validate product
      await ProductSchema.validateAsync(product);
      await client.query('BEGIN');
      const fillProductsQuery = {
        text: 'INSERT INTO products (title, description, price) VALUES ($1, $2, $3) RETURNING id',
        values: [product.title, product.description, product.price]
      };
      const fillProductsResult = await client.query(fillProductsQuery);
      console.log('fillProductsResult = ', fillProductsResult);

      const id = fillProductsResult.rows[0].id;
      const fillStocksQuery = {
        text: 'INSERT INTO stocks (product_id, count) VALUES ($1, $2)',
        values: [id, product.count]
      };
      const fillStocksResult = await client.query(fillStocksQuery);
      console.log('fillStocksResult = ', fillStocksResult);
      await client.query('COMMIT');
    }

    const snsMessageText = `
products
\n\n
${products.map(item => item.title).join(',\n')}
\n\n
have been successfully created
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
    await client.query('ROLLBACK');
    console.log('catalogBatchProcess error:', error);
    if (error.name === 'ValidationError' && error.isJoi) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({message: 'Validation Error'})
      };
    }
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
