const express = require("express");
const userRouter = express.Router();
const auth = require("../middlewares/auth");
const { Product } = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const Admin = require("../models/admin");
const ServiceOrders = require("../models/orderservices");
const Note = require("../models/notes");


userRouter.get("/api/get-products", async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $match: {
          category: { $in: ["Vegetable & Fruits", "Meat", "Home Made"] }
        }
      },
      {
        $group: {
          _id: "$category",
          products: { $push: "$$ROOT" } // Collect all products in an array
        }
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          products: { $slice: ["$products", 2] } // Limit to 2 products per category
        }
      },
      { $unwind: "$products" }, // Flatten the array
      {
        $replaceRoot: { newRoot: "$products" } // Convert back to original format
      }
    ]);

    return res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



userRouter.post("/api/add-to-cart", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);
    if (user.cart.length == 0) {
      user.cart.push({ product, quantity: 1 });
    } else {
      let isProductFound = false;
      for (let i = 0; i < user.cart.length; i++) {
        if (user.cart[i].product._id.equals(product._id)) {
          isProductFound = true;
        }
      }
      if (isProductFound) {
        let Producttt = user.cart.find((productt) =>
          productt.product._id.equals(product._id)
        );
        Producttt.quantity += 1;
      } else {
        user.cart.push({ product, quantity: 1 });
      }
    }
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRouter.delete("/api/remove-from-cart/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);

    for (let i = 0; i < user.cart.length; i++) {
      if (user.cart[i].product._id.equals(product._id)) {
        if (user.cart[i].quantity == 1) {
          user.cart.splice(i, 1);
        } else {
          user.cart[i].quantity -= 1;
        }
      }
    }
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRouter.post("/api/save-user-address", auth, async (req, res) => {
  try {
    const { address } = req.body;
    let user = await User.findById(req.user);
    user.address = address;
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// userRouter.post("/api/notes", auth, async (req, res) => {
//   try {
//     const { title, content } = req.body;
//     const user = await User.findById(req.user);
//     user.notes.push({ title, content });
//     await user.save();
//     res.status(201).json(user.  s); // Or send the newly added note
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// POST /api/notes - Create a new note
userRouter.post("/api/notes", auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newNote = new Note({ title, content, userId: req.user });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// PUT /api/notes/:id - Edit a specific note
userRouter.put("/api/notes/:id", auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user },
      { title, content },
      { new: true }
    );
    if (!updatedNote) return res.status(404).json({ message: "Note not found" });
    res.json(updatedNote);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/notes/find-by-title
userRouter.post("/api/notes/find-by-title", auth, async (req, res) => {
  try {
    const { title } = req.body;

    const notes = await Note.find({
   
      title: title           
    });

    res.json(notes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/notes/find-by-title
userRouter.post("/api/notes/find-by-userId", auth, async (req, res) => {
  try {
    

    const notes = await Note.find({
      userId: req.user,            
    });

    res.json(notes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});








// userRouter.post("/api/order", auth, async (req, res) => {
//   try {
//     const { cart, totalPrice, address,adminId } = req.body;
//     let products = [];
//     for (let i = 0; i < cart.length; i++) {
//       let product = await Product.findById(cart[i].product._id);
//       if (product.quantity >= cart[i].quantity) {
//         product.quantity -= cart[i].quantity;
//         products.push({ product, quantity: cart[i].quantity });
//         await product.save();
//       } else {
//         return res.status(400).json({ msg: "${product.name} is out of stock" });
//       }
//     }
//     let user = await User.findById(req.user);
//     user.cart = [];
//     user = await user.save();

//     let order = new Order({
//       products,
//       totalPrice,
//       address,
//       adminId,
//       userId: req.user,
//       orderedAt: new Date().getTime(),
//     });

//     order = await order.save();
//     res.json(order);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });
userRouter.post("/api/order", auth, async (req, res) => {
  try {
    const { cart, totalPrice, address, adminId } = req.body;

    let products = [];
    for (let i = 0; i < cart.length; i++) {
      // Extract productId correctly from the provided data structure
      const productId = cart[i].product.id; // Access `id` instead of `_id`

      if (!productId) {
        return res.status(400).json({ msg: "Product ID is missing in the cart item." });
      }

      // Fetch the product by ID
      let product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ msg: `Product with ID ${productId} not found.` });
      }

      // Check if the product has sufficient stock
      const requestedQuantity = cart[i].quantity;
      if (product.quantity >= requestedQuantity) {
        product.quantity -= requestedQuantity;
        products.push({ product, quantity: requestedQuantity });
        await product.save(); // Update product stock
      } else {
        return res
          .status(400)
          .json({ msg: `${product.name} is out of stock. Available quantity: ${product.quantity}` });
      }
    }

    // Clear the user's cart
    let user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }
    user.cart = [];
    user.address=address
    user = await user.save();

    // Create and save the order
    let order = new Order({
      products,
      totalPrice,
      address,
      adminId,
      userId: req.user,
      orderedAt: new Date().getTime(),
    });

    order = await order.save();
    res.json(order);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});



userRouter.get("/api/orders/me", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const orders = await Order.find({ userId: req.user });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


userRouter.get("/api/get-hotels",  async (req, res) => {
  try {

    const orders = await Admin.find({ });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }})


userRouter.post("/api/get-hotels-products",  async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id)
    const orders = await Product.find({ adminId:id });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
userRouter.post("/api/get-similar-products",  async (req, res) => {
  try {
    const { category } = req.body;
    console.log(category)
    const orders = await Product.find({ category:category });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRouter.post("/api/bookservice",auth, async (req,res)=>{
    try{
        const {serviceId} = req.body;
        const userId=req.user
        const status="pending"
        let user = await User.findById(req.user);
        let name =user.name
        let phoneNumber=user.phoneNo
        let address =user.address 
        
        const service = new ServiceOrders({name,userId,status,phoneNumber,address,serviceId});
        await service.save();
        return res.json(service);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})

userRouter.get("/api/get-bookservice", async (req,res)=>{
  try{
     
      const service = await ServiceOrders.find({})
      return res.json(service);
  }catch(error){
      res.status(500).json({ error: error.message });
  }
})

userRouter.get("/api/get-userservice",auth, async (req,res)=>{
  try{
     
      const service = await ServiceOrders.find({userId:req.user})
      return res.json(service);
  }catch(error){
      res.status(500).json({ error: error.message });
  }
})

userRouter.get("/user/get-profile", auth, async (req, res) => {
  try {
    const adminDetails = await User.findById(req.user);

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


userRouter.delete('/user/delete',auth, async (req, res) => {
  try {
   
    
    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(req.user);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = userRouter;
