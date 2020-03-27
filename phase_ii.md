# Phase II - User Authentication

In the MERN project, we received JSON web tokens from our client to help us identify who the current user in a session. We then used `passport`, an Express middleware, that took those web tokens which held user information and turned it into a `User` document and put it on the `request` of the current session. In this phase, we will be learning how to send up the JSON web tokens to our client using GraphQL and connecting the `passport` Express middleware to our `/graphql` route so we can identify the current user of a session.

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

Head over to your `User` Mongoose model file, `models/User.js`

------------ IN PROGRESS (let me know if you reach this point) -----------------------