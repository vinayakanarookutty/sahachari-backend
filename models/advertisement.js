const mongoose = require("mongoose");

const adverticementSchema = mongoose.Schema({
  adminId: {
    type: String,
  },
  adName: {
    type: String,
    required: true,
  },
  adImageUrl: {
    type: String,
    required: true,
  },
  
});
const Ads = mongoose.model("Advertisements", adverticementSchema);
module.exports =Ads;
