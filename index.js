//IMPORT FROM PACKAGES
const express = require("express");
const mongoose = require("mongoose");

//IMPORT FROM OTHER FILES
const authRouter = require("./routes/auth");
const adminRout = require("./routes/admin");
const productRouter = require("./routes/product");
const userRouter = require("./routes/user");

//INIT
const app = express();
const DB =process.env.MONGO_URI;
  

//MIDDLEWARE
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(authRouter);
app.use(adminRout);
app.use(productRouter);
app.use(userRouter);

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
