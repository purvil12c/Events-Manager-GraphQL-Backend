const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(bodyParser.json());

let events = [];

app.use('/graphql', graphqlHTTP({
  schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
      }

      type RootQuery {
          events: [Event!]!
      }

      type RootMutation {
          createEvent(eventInput: EventInput): Event
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
  rootValue: {
    events: () => {
      return events;
    },
    createEvent: (args) => {
      let event = {
        _id: Math.random().toString(),
        title: args.eventInput.title,
        description: args.eventInput.description,
        date: new Date().toISOString(),
        price: +args.eventInput.price
      }
      events.push(event);
      return event;
    },

  },
  graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@graphql-wgxh6.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
  .then(()=>{
    app.listen(3000);
  })
  .catch(err=>console.log(err));

