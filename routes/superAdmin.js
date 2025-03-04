const express = require("express");
const superAdminRouter = express.Router();
const { Product } = require("../models/product");
const Admin = require("../models/admin");
const Delivery = require("../models/delivery");
const Orders = require("../models/order");
const User = require("../models/user");
const Ads=require("../models/advertisement")
const Service=require("../models/service");

// Products
superAdminRouter.get("/api/get-products-details-super", async (req, res) => {
    try {
        const products = await Product.find({});
        return res.json(products);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admins
superAdminRouter.get("/api/get-admin-details-super", async (req, res) => {
    try {
        const admin = await Admin.find({});
        return res.json(admin);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delivery
superAdminRouter.get("/api/get-delivery-details-super", async (req, res) => {
    try {
        const delivery = await Delivery.find({});
        return res.json(delivery);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Oders
superAdminRouter.get("/api/get-order-details-super", async (req, res) => {
    try {
        const orders = await Orders.find({});
        return res.json(orders);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Users
superAdminRouter.get("/api/get-user-details-super", async (req, res) => {
    try {
        const user = await User.find({});
        return res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Advertisment 
superAdminRouter.get("/api/get-advertisment-details-super", async (req, res) => {
    try {
        const ads = await Ads.find({});
        return res.json(ads);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Services
superAdminRouter.post("/api/add_services", async (req,res)=>{
    try{
        const {name ,description ,contact} = req.body;
        const service = new Service({name ,description ,contact});
        await service.save();
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})


superAdminRouter.get("/api/view_services",async (req,res)=>{
    try{
        const services = await Service.find({});
        return res.json(services);
    }catch(error){
        res.status(500).json({error:error.message})
    }
})

module.exports = superAdminRouter;
