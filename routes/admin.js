const express = require("express");
const adminRout = express.Router();
const admin = require("../middlewares/admin");
const { Product } = require("../models/product");
const Order = require("../models/order");
const Admin =require("../models/admin")
const Ads=require("../models/advertisement")
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const delivery = require("../middlewares/delivery");
const Delivery = require("../models/delivery");
const dotenv =require("dotenv");
const { generateUploadURL } = require("../middlewares/s3");
dotenv.config()
adminRout.post("/admin/signup", async (req, res) => {
  try {
    console.log(req.body)
    const { name, email, password, servicablePincode, address, category } = req.body;

   
    if (
      !Array.isArray(servicablePincode) || 
      !servicablePincode.every(pincode => typeof pincode === "string")
    ) {
      return res.status(400).json({ msg: "servicablePincode must be an array of strings." });
    }

   
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User with the same email already exists!" });
    }


    const hashedPassword = await bcryptjs.hash(password, 8);

    
    let user = new Admin({
      email,
      password: hashedPassword,
      name,
      servicablePincode,
      address,
      category,
    });

    user = await user.save();
    res.status(201).json(user);
  } catch (e) {
    console.error("Error:", e.message); // Debugging log
    res.status(500).json({ error: e.message });
  }
});






adminRout.post("/admin/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this email doesnot exist!" });
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect Password" });
    }
    const token = jwt.sign({ id: user._id }, "passwordKey");
    res.json({ token, ...user._doc });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRout.patch("/admin/update-profile", admin, async (req, res) => {
  try {
    const { logo, servicablePincode, address } = req.body;

    // Check which field is being updated
    if (!logo && !servicablePincode && !address) {
      return res.status(400).json({ msg: "No data provided to update." });
    }

    // Prepare the update object based on the field provided
    const updateField = {};
    if (logo) updateField.logo = logo;
    if (servicablePincode) updateField.servicablePincode = servicablePincode;
    if (address) updateField.address = address;

    // Update the admin data based on email from JWT payload
    const updatedAdmin = await Admin.findOneAndUpdate(
      { _id: req.user }, // Use email from JWT payload
      updateField,
      { new: true } // Return the updated document
    );

    if (!updatedAdmin) {
      return res.status(404).json({ msg: "Admin not found." });
    }

    res.json(updatedAdmin);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRout.get("/admin/get-profile", admin, async (req, res) => {
  try {
    const adminDetails = await Admin.findById(req.user);

    if (!adminDetails) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Convert Mongoose document to plain object and remove the password field
    const { password, ...sanitizedDetails } = adminDetails.toObject();

    return res.json(sanitizedDetails);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});




adminRout.post("/admin/add-products", admin, async (req, res) => {
  try {
    const { name, description, images, quantity, price, category} = req.body;
    let product = new Product({
      adminId:req.user,
      name,
      description,
      images,
      quantity,
      price,
      category,
      adminId:req.user
    });
    product = await product.save();
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRout.get("/admin/get-products",admin,  async (req, res) => {
  try {
    const products = await Product.find({adminId:req.user});
    return res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



adminRout.post("/admin/add-advertisement", admin, async (req, res) => {
  try {
    const { adName,adImageUrl } = req.body;
    let ads = new Ads({
      adName,
      adImageUrl,
      adminId:req.user
    });
    ads = await ads.save();
    res.json(ads);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRout.get("/admin/get-advertisements", admin, async (req, res) => {
  try {
    const products = await Ads.find({adminId:req.user});
    return res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRout.post("/admin/delete-advertsement", admin, async (req, res) => {
  try {
    const { id } = req.body;
    let ads = await Ads.findByIdAndDelete(id);
    res.json(ads);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: e.message });
  }
});

adminRout.get("/addmin",  async (req, res) => {

    res.send("haiiiiiiiiiiiiii Route is getting");
});

adminRout.get("/admin/get-products", admin, async (req, res) => {
  try {
    const products = await Product.find({adminId:req.user});
    return res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRout.post("/admin/delete-product", admin, async (req, res) => {
  try {
    const { id } = req.body;
    let product = await Product.findByIdAndDelete(id);
    res.json(product);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: e.message });
  }
});

adminRout.get("/admin/get-orders", admin, async (req, res) => {
  try {
    // Fetch orders where adminId array contains req.user
    const orders = await Order.find({ adminId: { $in: [req.user] } });

    // Remove adminId from each order
    const sanitizedOrders = orders.map(order => {
      const { adminId, ...rest } = order.toObject(); // Convert Mongoose document to plain object
      return rest;
    });

    res.json(sanitizedOrders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



adminRout.post("/admin/change-order-status", delivery, async (req, res) => {
  try {
    const { id, status } = req.body;
    let order = await Order.findById(id);
    order.status = status;
    order = await order.save();

    res.json(order);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: e.message });
  }
});

adminRout.get("/admin/analytics", admin, async (req, res) => {
  try {
    const orders = await Order.find({});
    let totalEarnings = 0;
    for (let i = 0; i < orders.length; i++) {
      for (let j = 0; j < orders[i].products.length; j++) {
        totalEarnings +=
          orders[i].products[j].quantity * orders[i].products[j].product.price;
      }
    }
    //category wise order fetching

    let mobileEarnings = await fetchCategoryWiseProduct("Mobiles");
    let essentialEarnings = await fetchCategoryWiseProduct("Essentials");
    let applianceEarnings = await fetchCategoryWiseProduct("Appliances");
    let booksEarnings = await fetchCategoryWiseProduct("Books");
    let fashionEarnings = await fetchCategoryWiseProduct("Fashion");

    let earnings = {
      totalEarnings,
      mobileEarnings,
      essentialEarnings,
      applianceEarnings,
      booksEarnings,
      fashionEarnings,
    };
    res.json(earnings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

async function fetchCategoryWiseProduct(category) {
  let earnings = 0;
  let categoryOrders = await Order.find({
    "products.product.category": category,
  });
  for (let i = 0; i < categoryOrders.length; i++) {
    for (let j = 0; j < categoryOrders[i].products.length; j++) {
      earnings +=
        categoryOrders[i].products[j].quantity *
        categoryOrders[i].products[j].product.price;
    }
  }
  return earnings;
}

adminRout.post("/admin/get-user",  async (req, res) => {
  try {
    const { userId } = req.body;
    let user = await User.findById(userId)
    res.json({address:user.address,phoneNo:user.phoneNo,name:user.name});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRout.post("/delivery/signup", async (req, res) => {
  try {
    console.log(req.body)
    const { name, email, password, servicablePincode,  } = req.body;

   
    if (
      !Array.isArray(servicablePincode) || 
      !servicablePincode.every(pincode => typeof pincode === "string")
    ) {
      return res.status(400).json({ msg: "servicablePincode must be an array of strings." });
    }

   
    const existingUser = await Delivery.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User with the same email already exists!" });
    }


    const hashedPassword = await bcryptjs.hash(password, 8);

    
    let user = new Delivery({
      email,
      password: hashedPassword,
      name,
      servicablePincode,
      orders:[]
    });

    user = await user.save();
    res.status(201).json(user);
  } catch (e) {
    console.error("Error:", e.message); // Debugging log
    res.status(500).json({ error: e.message });
  }
});






adminRout.post("/delivery/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Delivery.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this email doesnot exist!" });
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect Password" });
    }
    const token = jwt.sign({ id: user._id }, "passwordKey");
    res.json({ token, ...user._doc });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRout.post("/delivery/change-order-status", delivery, async (req, res) => {
  try {
    const { id, status } = req.body;
    let order = await Order.findById(id);
    order.status = status;
    order = await order.save();

    res.json(order);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: e.message });
  }
});

adminRout.get('/admin/s3Url', async (req, res) => {
  const url = await generateUploadURL()
  res.send({url})
})


adminRout.get("/delivery/get-orders", async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



adminRout.post("/delivery/added-orders", delivery,async (req, res) => {
  try {
    const { id } = req.body;
    const order = await Order.findById(id);
    const user = await Delivery.findById(req.user);
    user.orders.push(order)
    await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
adminRout.get("/delivery/get-added-orders", delivery,async (req, res) => {
  try {
 
    const user = await Delivery.findById(req.user);

    res.json(user.orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRout.post("/delivery/get-admin", async (req, res) => {
  try {
    const { adminId } = req.body; // Expecting adminId to be an array

    // Check if adminId is an array
    if (!Array.isArray(adminId)) {
      return res.status(400).json({ error: "adminId must be an array" });
    }

    // Fetch all admin users whose IDs are in the adminId array
    const users = await Admin.find({ _id: { $in: adminId } });

    // Map the required fields from the user data
    const responseData = users.map(user => ({
      address: user.address,
      name: user.name
    }));

    // Return the mapped data
    res.json(responseData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRout.post('/admin/delete',admin, async (req, res) => {
  try {
   
    
    // Find and delete the user
    const deletedUser = await Admin.findByIdAndDelete(req.user);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

adminRout.get('/admin/delete',admin, async (req, res) => {
  try {
   
    
    // Find and delete the user
    const deletedUser = await Admin.findById(req.user);
    
   

    res.status(200).json({ message: 'User deleted successfully', user: deletedUser.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = adminRout;
