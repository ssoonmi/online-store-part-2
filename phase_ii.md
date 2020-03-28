# Phase II - User Authentication

In the MERN project, we received JSON web tokens from our client to help us identify who the current user in a session. We then used `passport`, an Express middleware, that took those web tokens which held user information and turned it into a `User` document and put it on the `request` of the current session. In this phase, we will be learning how to send up the JSON web tokens to our client using GraphQL and connecting the `passport` Express middleware to our `/graphql` route so we can identify the current user of a session.

These steps will be similar to how we did it in the MERN project, so this should mostly be review.

## Install Dependencies

Let's `npm install` the following dependencies:

- jsonwebtoken
- passport
- passport-jwt
- bcryptjs
- validator

## Signing Up a User

Yesterday, we used a crude way for signing up a user which stores the password directly into our database. Super unsafe.

Let's make it safer by hashing the password using `bcryptjs` and store the hashed password in our database instead.

To make signing up a user easier, we are going to define a function on the `User` model (not document) called `signUp` that takes in an email and a password.

Head over to your `User` Mongoose model file, `models/User.js`. 

Right after our schema definition, let's create our `signUp` method on the `UserSchema` that takes in an email and password, like so:

```javascript
// models/User.js after UserSchema definition
UserSchema.statics.signUp = function(email, password) {
  //
};
```

Notice how we are defining the `signUp` method on `UserSchema.statics`. **`Static` methods** are methods that you can run on the model itself. Whereas **regular `methods`** are methods that are run on the document of a that Model.

For example, a function called `signUp` defined on `UserSchema.statics` would be called like:

```javascript
const user = User.signUp(email, password);
```

A function called `getAllProductsOrdered` defined on `UserSchema.methods` would be called like:

```javascript
const user = await User.findById(userId); // user is a document
const orders = await user.getAllProductsOrdered(); // getAllProductsOrdered is called on a user document
```

Let's fill in our `signUp` method.

The `password` that we receive as the input should be hashed by `bcryptjs` using the `bcrypt.hash` method. However, this method is asynchronous, so let's make sure to make the `signUp` method `async` so we can `await` for the `bcrypt.hash` method.

```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

Make sure to import `bcryptjs` properly at the top of this file.

Next, let's create a new `User` and save that user. `user.save()` is also an asynchronous function, so make sure to `await` that as well. Let's add the key of `token` onto the user document. This `token` will be the JSON web token that will be used to identify this user again later as the current user.

JWT's require a secret key to sign with. Let's create one in our `config/keys.js` file as a key of `secretOrKey` set to whatever string you want.

To create the JWT, we will need to import `jsonwebtoken` and that `secretOrKey` string from our `config/keys.js` file.

```javascript
// models/User.js top of file
const jwt = require('jsonwebtoken');
const secret = require('../config/keys').secretOrKey;
```

Once we do that, we need to call the `jwt.secret` passing in the information we want to encrypt and the `secret` key. Let's just encrypt the `_id` of the user for now.

```javascript
const token = jwt.sign({ _id: user._id }, secret);
```

Now, let's set the key of `token` on the `user` document to be the string of `'Bearer ' + token'`.

```javascript
user.token = 'Bearer ' + token;
```

We do this because passport will be expecting the JSON web token to be after the string of `'Bearer '` and decrypting it.

Make sure to return the `user` at the end of your function.

Head over to your `schema/types/User.js` file. In your `signUp` mutation resolver, let's call our newly created function and return it!

If you're thinking, hang on, our client know what the `token` is once we `signUp` a user using the mutation. You're right. We need to specify it as a field to the return type of our `signUp` mutation. 

In our `Mutation` type definition in our `schema/types/User.js` file, we added the `signUp` field which should return a `User` type. We could just add the `token` field to a `User` type to send up our token, but we don't want all the other queries and mutations to also be able to query for `token` on just any `User` type.

That's why we will be defining a NEW type called `UserCredentials` which will have the same exact fields as the `User` type EXCEPT for the added `token` field. Let's add it to our `schema/types/User.js` type definitions and set our `signUp` field in our type definitions to return a `UserCredentials` type.

**If you need help understanding why we do this, please make sure to ask a question.**

Test it out the `signUp` mutation using Playground and see if you get what seems like a valid `token` back.

Perfect! We were able to send up a JSON web token when signing up a user!

## Adding the Current User to Context

Now that we have the `token`, how do we use it in our future GraphQL queries and mutations to help us identify who the current user is in each query and mutation?

Our client will be sending the `token` it received (after logging in or signing up) through our `HTTP Authorization Header`. The `passport` Express middleware will be able to extract that `token` from the authorization header of our HTTP GraphQL request, decrypt the `token`, and see if there is a `User` in our database with those credentials.

Let's start setting up and configuring `passport`.

Create a file called `passport.js` in your `config` folder. Here we will configure what `passport` should be doing once any GraphQL request comes in. 

Let's define the following at the top of the file: 

```javascript
// config/passport.js
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('User');
const secretOrKey = require('./keys').secretOrKey;
```

Notice that we are using the `passport-jwt` package here. `JwtStrategy` is going to be a middleware for our `passport` package (a middleware for a middleware) and will be decrypting our `token` for us, but we need to tell it what the `secretOrKey` is and what how to extract the JWT from our request.

Let's initialize an `options` object, like so:

```javascript
// config/passport.js after imports
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey
}
```

These options will be used to configure our `JwtStrategy` middleware.

Let's define a function that will take in the `passport` middleware, apply the `JwtStrategy` middleware to it, and export that function.

```javascript
// config/passport after options
module.exports = passport => { 
  passport.use(new JwtStrategy(options, async (token, done) => {
    if (token) {
      const user = await User.findById(token._id);
      return done(null, user);
    }
    return done(null, false);
  }));
};
```

The first argument to the `new JwtStrategy` is the `options` object we defined, and the second argument is going to be a callback function. That callback function will be called by `JwtStrategy` with the decrypted `token` as the first argument, and the second argument is a function that, when called, will trigger the next part of `passport`.

If there is a valid decrypted `token` then we will try to find a `user` by the `_id` stored in that token and invoke the `done` callback with that `user`.

If there is no valid decrypted `token` from our authentication header, then we will just invoke the `done` callback with false.

Now, let's configure how we want the `passport` middleware to handle the information about the `user` we found. 

Let's create a `middlewares.js` file in our root directory and define the following function 

```javascript
// middlewares.js
const passportAuthenticate = (passport) => (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (user) req.user = user;
    next();
  })(req, res, next)
}

module.exports = {
  passportAuthenticate
};
```

This function will take in the `passport` and define how the `passport` will handle the `user` that was passed in previously. Basically, if there is a `user` that was passed in using the `done` callback from before, it will add it to the request object, `req`, which will be the `context` to all of our GraphQL resolvers.

Finally, let's initialize passport in our server entry file.

At the top of your server entry file, `index.js`, import `passport`, add our `JwtStrategy` middleware, initialize `passport`, and import the `passportAuthenticate` function like so:

```javascript
// index.js somewhere after importing mongoose models
const passport = require('passport');
require('./config/passport')(passport);
app.use(passport.initialize());
const { passportAuthenticate } = require('./middlewares');
```

Next, let's actually use our `passport` middleware to our GraphQL route, `/graphql`.

```javascript
// index.js
app.use(
  "/graphql",
  passportAuthenticate(passport),
  graphqlHTTP({
    schema: schema,
    rootValue: resolvers
  })
);
```

Awesome! Now all our GraphQL resolver functions should have a key of `user` on the `context` argument. (Explanation of `context` here: [Resolver Reading].)

Now let's try making a mutation or a query with the `token` in our `authorization` header in Playground. Take a look at the [Formulating Queries and Mutation Reading under the 'Performing a Mutation' section] to see how to do this.

Pick a `Query` or `Mutation`, and let's put a `console.log(context.user)` in the resolver function for that `Query` or `Mutation` to see if our set up is working properly!

e.g.:

```javascript
const resolvers = {
  // ...
  Query: {
    categories(_, __, context) {
      console.log(context.user)
      // ...
    }
  }
  // ...
}
```

If it's printing out the current user information, then great!

## `me` Query

Let's create a query that will return the current user's information. There should be no arguments to this query and it should just return a `User` type. Make the `typeDefs` and `resolvers` for this query and determine which file they should be in. Afterwards, test this query out in Playground.  

We did it! We successfully authenticated and identified the current user for a single GraphQL request!

## Only Show Orders for the Current User

Let's re-work our `orders` resolver on our `User` type. We only want to return an array of `orders` if the `User` being queried is the current user.

## Other Protected Queries/Mutations

Now that we have an authenticated user to make queries and mutations with, let's have some fun!!

Try making the following queries and mutations:

- orders - returning only the current user's orders
- order - return the order only if it's the current user's order
- makeOrder
- cancelOrder
- createProduct - but only an `owner` or `admin` can create it
- deleteProduct - but only an `owner` or `admin` can delete it
- createCategory - but only an `owner` or `admin` can create it
- deleteCategory - but only an `owner` or `admin` can delete it


[Resolver Reading]: https://github.com/ssoonmi/mern-graphql-curriculum/blob/master/resolvers.md
[Formulating Queries and Mutation Reading under the 'Performing a Mutation' section]: https://github.com/ssoonmi/mern-graphql-curriculum/blob/master/formulating_queries_and_mutations.md#performing-a-mutation