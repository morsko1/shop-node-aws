import { Pool } from 'pg';
import mockData from './mockData.json';

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

    const dropQuery = 'DROP TABLE IF EXISTS public.products CASCADE; DROP TABLE IF EXISTS public.stocks CASCADE;'
    const dropQueryResult = await client.query(dropQuery);
    console.log('dropQueryResult =\n', dropQueryResult);

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

    const createStocksTableQuery = {
      text: `
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";
        CREATE TABLE IF NOT EXISTS stocks(
          product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          count INT,
          CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES products (id)
        )`
    };
    const stocksTableResult = await client.query(createStocksTableQuery);
    console.log('stocksTableResult =\n', stocksTableResult);

    async function fillDB () {
      for (let i = 0; i < mockData.length; i++) {
        const item = mockData[i];
        const fillProductsQuery = {
          text: 'INSERT INTO products (title, description, price) VALUES ($1, $2, $3) RETURNING id',
          values: [item.title, item.description, item.price]
        };
        const fillProductsResult = await client.query(fillProductsQuery);
        console.log('fillProductsResult =\n', fillProductsResult);

        const id = fillProductsResult.rows[0].id;
        const fillStocksQuery = {
          text: 'INSERT INTO stocks (product_id, count) VALUES ($1, $2)',
          values: [id, item.count]
        };
        const fillStocksResult = await client.query(fillStocksQuery);
        console.log('fillStocksResult =\n', fillStocksResult);
      }
    }

    fillDB();

  } catch (error) {
    console.log('initDB error = ', error);
  } finally {
    client.release();
  }
};

export default initDB;
