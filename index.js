//IMPORT FROM PACKAGES
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")
//IMPORT FROM OTHER FILES
const authRouter = require("./routes/auth");
const adminRout = require("./routes/admin");
const productRouter = require("./routes/product");
const userRouter = require("./routes/user");
const superAdminRouter = require("./routes/superAdmin");
//INIT
const app = express();
const DB ="mongodb://admin:securepassword@54.173.132.195:27017/admin";
 
app.use(cors())
//MIDDLEWARE
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(authRouter);
app.use(adminRout);
app.use(productRouter);
app.use(userRouter);
app.use(superAdminRouter);

//CONNECTIONS
mongoose
  .connect(DB,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connection successful");
  })
  .catch((e) => {
    console.log(e);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
