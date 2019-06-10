const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const Event = require('./models/event');

const app = express();

app.use(bodyParser.json());

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
        price: Float!,
        date: String!
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
      return Event.find()
        .then(events=>{
          return events.map(event=>{
            return {...event._doc, _id: event._doc._id.toString()};
          });
        })
        .catch(err=>{
          console.log(err);
          throw err;
        })
    },
    createEvent: (args) => {
      let event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        date: new Date(args.eventInput.date),
        price: +args.eventInput.price
      });
      return event.save()
        .then(result=>{
          return {...result._doc, _id: event._doc._id.toString()};
        })
        .catch(err=>{
          console.log(err);
          throw err;
        })
    },

  },
  graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@graphql-wgxh6.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
  .then(()=>{
    app.listen(3000);
  })
  .catch(err=>console.log(err));

