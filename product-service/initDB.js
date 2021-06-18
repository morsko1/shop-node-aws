import { Pool } from 'pg';

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

const initDB = async () => {
  const pool = new Pool(options);
  let client;
  try {
    client = await pool.connect();
    console.log('client =\n', client.database);
    /*
    products:
    id -  uuid (primary key)
    title - text, not null
    description - text
    price - integer
    */

    /*
    stocks:
    product_id - uuid (foreign key from products.id)
    count - integer (There are no more products than this count in stock)
    */

    const createProductsTableQuery = {
      text: `
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";
        CREATE TABLE IF NOT EXISTS products(
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          price INT
        )`
    };
    const productsTableResult = await client.query(createProductsTableQuery);
    console.log('productsTableResult =\n', productsTableResult);

    // const createStocksTableQuery = {
    //   text: `
    //     CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    //     CREATE TABLE IF NOT EXISTS products(
    //       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    //       title TEXT NOT NULL,
    //       description TEXT,
    //       price INT
    //     )`
    // };
    // const stocksTableResult = await client.query(createStocksTableQuery);
    // console.log('stocksTableResult =\n', stocksTableResult);
  } catch (error) {
    console.log('initDB error = ', error);
  } finally {
    client.release();
  }
};

export default initDB;
