import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 8080;

app.use('*', async (req, res) => {
  try {
    // prepare URL to route incoming request
    const originalUrl = req.originalUrl;
    console.log('originalUrl = ', originalUrl);
    const recipientServiceName = originalUrl.split('/')[1];
    const serviceUrl = process.env[recipientServiceName];
    console.log('serviceUrl = ', serviceUrl);
    const recipientPath = originalUrl.slice(originalUrl.indexOf('/', 1));
    console.log('recipientPath = ', recipientPath);
    const recipientURL = serviceUrl + recipientPath;
    console.log('recipientURL = ', recipientURL);

    // prepare the request (body if necessary)
    const method = req.method;
    const body = req.body;
    console.log('method = ', method);
    console.log('body = ', body);

    const requestConfig = {
      method,
      url: recipientURL,
      ...( (body && Object.keys(body).length > 0) && {data: body} )
    };
    console.log('requestConfig = ', requestConfig);

    // send the request to appropriate server

    const response = await axios(requestConfig);
    console.log('typeof response = ', typeof response.data);
    console.log('response = ', response.data);

    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.send(JSON.stringify(response.data));
  } catch(error) {
    console.log('error = ', error);
    res.status(502).send('Couldn\'t process the request');
  }
});

app.listen(port, () => {
  console.log(`listen on ${port}`);
});
