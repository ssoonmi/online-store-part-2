const mongoose = require('mongoose');
const Schema = mongoose.Schema

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }
});

module.exports = mongoose.model('Product', ProductSchema);