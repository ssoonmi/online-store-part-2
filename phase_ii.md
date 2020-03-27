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



------------ IN PROGRESS (let me know if you reach this point) -----------------------