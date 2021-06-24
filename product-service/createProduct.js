import { Client } from 'pg';
import joi from 'joi';

const { PG_HOST, PG_PORT, PG_DBNAME, PG_USERNAME, PG_PASSWORD } = process.env;

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

const createProduct = async (event) => {
  const client = new Client(options);
  try {
    console.log('createProduct event: ', event);
    await client.connect();
    await client.query('BEGIN');
    const product = JSON.parse(event.body);
    console.log('createProduct product: ', product);

    // validate product
    await ProductSchema.validateAsync(product);

    const fillProductsQuery = {
      text: 'INSERT INTO products (title, description, price) VALUES ($1, $2, $3) RETURNING id',
      values: [product.title, product.description, product.price]
    };
    const fillProductsResult = await client.query(fillProductsQuery);

    const id = fillProductsResult.rows[0].id;
    const fillStocksQuery = {
      text: 'INSERT INTO stocks (product_id, count) VALUES ($1, $2)',
      values: [id, product.count]
    };
    await client.query(fillStocksQuery);
    await client.query('COMMIT');
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({message: `Product with id "${id}" has been successfully created`})
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.log('createProduct error: ', error);
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

export default createProduct;
