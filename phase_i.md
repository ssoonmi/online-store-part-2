# Phase I - Organize Our Schema Files

In this phase, we are going to learn how to organize our schema. 

Our schema can get big very quickly. We only had to define 4 Object Types, but imagine if our app required us to have even a couple more. Our schema `index.js` file can exceed the amount of acceptable lines of code in a file.

## Separating our Schema based on Types

Let's create a folder called `types` in our `schema` folder. Here we will separate out our types based on Object Type.

Our first Object Type to refactor is the `User` type. Let's make a file called `User.js` in our `types` folder.

Here we will define a variable called `typeDefs` and `resolvers`, just like in the `index.js` file. Let's assign the type defintions and resolvers related to the `User` type from the `schema/index.js` file to these variables.

We should end up with something like this:

```javascript
// schema/types/User.js
const typeDefs = `
type User {
  _id: ID!
  email: String!
  orders: [Order]
}
type Mutation {
  signup(email: String, password: String): User
}
`;

const resolvers = {
  User: {
    orders(parentValue, _) {
      return Orders.find({ user: parentValue._id });
    }
  },
  Mutation: {
    signup(_, { email, password }) {
      const newUser = new User({ email, password });
      return newUser.save();
    },
  }
};
```

Make sure to import the Mongoose models that you will be using in this file at the top.

Now, let's try exporting the `typeDefs` and `resolvers` from this file as an object with keys of `typeDefs` and `resolvers`.

Great! Let's create an `index.js` file in our `types` folder as well. Here, we will be importing our `User.js` file, which is an object, and export it by nesting it in an array. 

We should end up with something like this:

```javascript
// schema/types/index.js
module.exports = [
  require('./User')
]
```

## Merging the Type Definitions

Let's now head back to our `schema/index.js` file and import the `schema/types/index.js` file at the top and set it to a variable called `types`.

We need to now somehow merge the `typeDefs` and `resolvers` in this `schema/index.js` file with our `typeDefs` and `resolvers` in our `User.js` file.

Let's rename the `typeDefs` in the `schema/index.js` file to `otherTypeDefs`.

After the defintion of `resolvers`, let's define the `typeDefs` variable. The `typeDefs` variable should be set to an array with all the type definitions from the `types` file and the `otherTypeDefs` as elements. 

Remember, the structure of the `types` variable that you imported from `schema/types/index.js` should look like this.

```javascript
console.log(types); 
// => 
// [
//   {
//     typeDefs: all the User type defintions,
//     resolvers: all the User resolvers
//   }
// ]
```

When you examine the structure of your `typeDefs` variable, it should look like this:

```javascript
console.log(typeDefs);
// =>
// [
//   all the User type definitions,
//   otherTypeDefs
// ]
```

**Try coming up with the syntax for this on your own before looking below. If you need help formulating this, call over a TA.**

Here is an example of what your `typeDefs` could look like:

```javascript
const typeDefs = [...types.map(type => type.typeDefs), otherTypeDefs];
```

Awesome! Now make sure the `typeDefs` your are exporting from this file and invoking `makeExecutableSchema` are pointing to the value of the `typeDefs` variable you just created.

The reason why this works is because `typeDefs` can be either a string of type definitions or an array of strings.

## Merging the Resolvers

Let's try merging our resolvers now.

Let's rename the `resolvers` in the `schema/index.js` to `otherResolvers`. We need to somehow merge all the `resolvers` objects from all the different schema types and the `otherResolvers` object together.

**Can you see an issue with using `Object.assign` to merge in this scenario? Take a minute to think about this.**

`Object.assign` is a shallow merge rather than a deep merge. If we use it to merge all the different `resolvers` objects, then the nested objects will not be merged. In our `User` resolvers object, we define a `Mutation` key that has a nested object as its value. But in our `otherResolvers` object, we also have a `Mutation` key that has a nested object. One of these nested objects will be lost if we use a shallow merge like `Object.assign`. 

Since it's annoying to come up with our own deep merge function, we will just use `merge` from the `lodash` package.

Let's `npm install lodash` and import merge from lodash at the top of our file.

```javascript
// schema/index.js
const { merge } = require('lodash');
```

Let's create a variable underneath our `typeDefs` variable called `resolvers`.

**Try to come up with the syntax for merging the resolvers from the `types` array and the `otherResolvers` on your own.**

Your `resolvers` could look something like this:

```javascript
const resolvers = merge(...types.map(type => type.resolvers), otherResolvers);
```

Now make sure the `resolvers` your are exporting from this file and invoking `makeExecutableSchema` are pointing to the value of the `resolvers` variable you just created.

## Extend Types

Let's try testing this out! Start the development server.

Uh oh! You should see a nasty error pop up in your server. Take a look at it and read it. 

If you set everything up correctly, you should see a single error, `'There can be only one type name "Mutation"'`.

Can you deduce why we get this error message?

We defined a `Mutation` type in both the `User` schema type AND in the `otherTypeDefs`. We cannot define duplicate types in a GraphQL schema, but we can extend a GraphQL type to add more fields into it. 

In our `User.js` file, let's add the keyword `extend` in front of `type Mutation`:

```graphql
extend type Mutation {
  ...
}
```

Your error should go away in your server logs now!

## Separate out the Rest of the Types

Let's separate out the rest of the Object Types in our `types` folder the same way we did for the `User` type.

Note: the `Query` type needs to be extended just like the `Mutation` type.

If you end up with an empty `Query` or `Mutation` type in the `schema/index.js` file, then you can add a field called `_empty` that returns a type of `String`:

```graphql
type Mutation {
  _empty: Boolean
}
```

When you add an underscore, `_`, in front of a field, that field does not need to have a resolver function for it.

Instead of `_empty`, many people use just `_`.

## Wrapping Up

Make sure your queries and mutations still work when using Playground! 

We successfully set up the separation of our schema into multiple files!

Head over to [Phase II]!

[Phase II]: /phase_ii.md