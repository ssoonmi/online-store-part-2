const mongoose = require('mongoose');
require('./models');
const db = require('./config/keys').mongoURI;

const { Faker } = require('fakergem');

const User = mongoose.model('User');
const Category = mongoose.model('Category');
const Product = mongoose.model('Product');
const Order = mongoose.model('Order');

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.log(err));

const seedDatabase = async () => {
  const user = new User({ email: 'demo@aa.io', password: 'password' });
  await user.save();

  const categories = [];
  for (let i = 0; i < 10; i++) {
    const category = new Category({ name: Faker.SlackEmoji.activity() });
    const savedCategory = await category.save().catch(() => console.log('Duplicate category'));
    if (savedCategory) categories.push(savedCategory);
  }

  const products = [];
  for (let j = 0; j < 30; j++) {
    const randomCategory = Faker.Random.element(categories)
    const product = new Product({
      name: Faker.SlackEmoji.objectsAndSymbols(),
      description: Faker.HarryPotter.quote(),
      price: Math.floor((Math.random() * 10000) + 1) / 100,
      category: randomCategory._id
    });
    const savedProduct = await product.save().catch(() => console.log('Duplicate product'));
    if (savedProduct) products.push(savedProduct);
  }

  for (let k = 0; k < 5; k++) {
    const orderProducts = [];
    for (let l = 0; l < Math.floor((Math.random() * 10) + 1); l++) {
      const randomProduct = Faker.Random.element(products);
      orderProducts.push(randomProduct._id);
    }
    const order = new Order({
      user: user._id,
      products: orderProducts
    })
    await order.save();
  }

  mongoose.connection.close()
}

seedDatabase().then(() => console.log('Successfully seeded database')).catch((e) => console.log('An error occured while seeding', e))