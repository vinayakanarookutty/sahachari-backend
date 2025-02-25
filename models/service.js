const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^\d{10,15}$/.test(v); // Ensure only numbers (10-15 digits)
            },
            message: "Invalid contact number format"
        }
    }
}, { timestamps: true });

// ✅ Correct export
const Service = mongoose.model("Service", ServiceSchema);
module.exports = Service;
