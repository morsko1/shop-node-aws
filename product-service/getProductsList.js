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

const getProductsList = async (event) => {
  const client = new Client(options);
  try {
    await client.connect();
    const query = 'SELECT p.id, p.title, p.description, p.price, s.count FROM products p INNER JOIN stocks s ON p.id = s.product_id';
    const result = await client.query(query);
    const res = {
      data: result.rows
    };
    return {
      statusCode: 200,
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

export default getProductsList;
