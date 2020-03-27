const mongoose = require('mongoose');
const { merge } = require('lodash');
const { makeExecutableSchema } = require('graphql-tools');

const types = require('./types');

const User = mongoose.model('User');
const Category = mongoose.model('Category');
const Product = mongoose.model('Product');
const Order = mongoose.model('Order');

const otherTypeDefs = `
type Product {
  _id: ID!
  name: String!
  description: String
  category: Category
}
type Category {
  _id: ID!
  name: String!
  products: [Product]
}
type Order {
  _id: ID!
  user: User
  products: [Product]
}
type Query {
  categories: [Category]
  category(_id: ID!): Category
  products: [Product]
  product(_id: ID!): Product
  orders: [Order]
  order(_id: ID!): Order
}
type Mutation {
  createProduct(name: String! description: String, price: Float, categoryId: ID!): Product
  createCategory(name: String!): Category
}
`;

const otherResolvers = {
  Query: {
    categories(_, __) {
      return Category.find({});
    },
    category(_, { _id }) {
      return Category.findById(_id);
    },
    products(_, __) {
      return Product.find({});
    },
    product(_, { _id }) {
      return Product.findById(_id);
    },
    orders(_, __) {
      return Order.find({});
    },
    order(_, { _id }) {
      return Order.findById(_id);
    }
  },
  Category: {
    products(parentValue, _) {
      return Product.find({ category: parentValue._id });
    }
  },
  Product: {
    category: async (parentValue, _) => {
      const product = await parentValue.populate('category').execPopulate();
      return product.category;
    }
  },
  Order: {
    user: async (parentValue, _) => {
      const order = await parentValue.populate('user').execPopulate();
      return order.user;
    },
    products: async (parentValue, _) => {
      const order = await parentValue.populate('products').execPopulate();
      return order.products;
    }
  },
  Mutation: {
    createCategory(_, { name }) {
      const category = new Category({ name })
      return category.save();
    },
    createProduct: async (_, { name, description, price, categoryId }) => {
      const category = await Category.findById(categoryId);
      if (!category) throw new Error(`Category with ID ${categoryId} not found`);
      const product = new Product({ name, description, price, categoryId });
      return product.save();
    }
  }
};

const typeDefs = [...types.map(type => type.typeDefs), otherTypeDefs];

const resolvers = merge(...types.map(type => type.resolvers), otherResolvers);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

module.exports = {
  schema,
  typeDefs,
  resolvers
}