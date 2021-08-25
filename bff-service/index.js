import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 3001;

app.use('*', (req, res) => {
  console.log('req = ', req);
  res.send({success: true});
});

app.listen(port, () => {
  console.log(`listen on ${port}`);
});
