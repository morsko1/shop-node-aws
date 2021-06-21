import { Client } from 'pg';

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

const getProductsById = async (event) => {
  const client = new Client(options);
  try {
    const { productId = '' } = event.pathParameters;
    await client.connect();
    const query = {
      text: 'SELECT p.id, p.title, p.description, p.price, s.count FROM products p INNER JOIN stocks s ON p.id = s.product_id AND p.id = $1',
      values: [productId]
    };
    const result = await client.query(query);
    const product = result.rows[0];

    const res = product ? {data: product} : {message: 'Product not found'};

    return {
      statusCode: product ? 200 : 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(res)
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

export default getProductsById;
