const jwt = require("jsonwebtoken");


const delivery = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({ msg: "Please Login" });
    }

    const verified = jwt.verify(token, "passwordKey");
    if (!verified) {
      return res
        .status(401)
        .json({ msg: "Token verification failed, authorization denied" });
    }

  

    req.user = verified.id;
    req.token = token;
    next();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = delivery;
