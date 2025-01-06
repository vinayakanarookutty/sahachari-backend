const mongoose = require("mongoose");


const adminSchema = mongoose.Schema({
  name: {
    required: true,
    type: String,
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
  servicablePincode: {
    type: String,
  },
  logo: {
    type: String,
  },
 
},{strict:false});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
