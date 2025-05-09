const mongoose = require("mongoose");
const { productSchema } = require("./product");
const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const userSchema = mongoose.Schema({
  name: {
    required: true,
    type: String,
    trim: true,
  },
  email: {
    required: true,
    type: String,
    trim: true,
    validate: {
      validator: (value) => {
        const re =
          /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return value.match(re);
      },
      message: "Please enter a valid email address",
    },
  },
  notes: [noteSchema],
  password: {
    required: true,
    type: String,
    validate: {
      validator: (value) => {
        return value.length > 6;
      },
      message: "Please enter a long password",
    },
  },
  address: {
    type: String,
    default: "",
  },
  place: {
    type: String,
    default: "",
  },
  phoneNo: {
    type: String,
    default: "",
    validate: {
      validator: (value) => /^\d{10}$/.test(value),
      message: "Phone number must be exactly 10 digits",
    }
  },
  pincode: {
    type: [String]
  },
  type: {
    type: String,
    default: "user",
  },
  cart: [
    {
      product: productSchema,
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
},{strict:false});

const User = mongoose.model("User", userSchema);
module.exports = User;
