const mongoose = require("mongoose");

const ServiceOrdersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    userId:{
        required:true,
        type:String
          },
    phoneNumber: {
        type: String,
    },
    address: {
        type: String,
        required: true
    },
    serviceId: {
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true
    }
  
}, { timestamps: true });

// ✅ Correct export
const ServiceOrders = mongoose.model("ServiceOrders", ServiceOrdersSchema);
module.exports = ServiceOrders;
