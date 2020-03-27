# Phase II - User Authentication

In the MERN project, we received JSON web tokens from our client to help us identify who the current user in a session. We then used `passport`, an Express middleware, that took those web tokens which held user information and turned it into a `User` document and put it on the `request` of the current session. In this phase, we will be learning how to send up the JSON web tokens to our client using GraphQL and connecting the `passport` Express middleware to our `/graphql` route so we can identify the current user of a session.

## 