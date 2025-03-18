const mongoose = require("mongoose");

const ServiceOrdersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    serviceId: {
        type: String,
        required: true
    },
  
}, { timestamps: true });

// ✅ Correct export
const ServiceOrders = mongoose.model("ServiceOrders", ServiceOrdersSchema);
module.exports = ServiceOrders;
