const express = require('express');
const mongoose = require('mongoose');
require('./models');
const { schema, resolvers } = require('./schema');
const graphqlHTTP = require('express-graphql');
const expressPlayground = require('graphql-playground-middleware-express').default;
const db = require('./config/keys').mongoURI

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.log(err));

const app = express();

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: resolvers
  })
);

app.get("/playground", expressPlayground({ endpoint: "/graphql" }));

app.get('/hello', (req, res) => {
  debugger
  res.json('Hello World!');
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on port ${port}`));