const jwt = require("jsonwebtoken");
const Admin = require("../Modal/AdminModel");

module.exports = async (req, res, next) => {
  //    get token from header
  const bearerHeader = req.header("authorization");
  //    check if no token
  if (!bearerHeader)
    return res
      .status(401)
      .json({ status: false, message: "No token, authorization denied" });
  //    verify token
  else {
    try {
      // const bearer= bearerHeader.split(' ');
      //         const bearerToken = bearer[1];
      const decoded = jwt.verify(bearerHeader, process.env.JWT);
      userEmail = decoded.user.email;
      req.user = decoded;

      const adminData = await Admin.findOne({ email: userEmail });
      if (adminData) {
        next();
      } else {
        res.status(401).json({ status: false, message: "Token is not valid" });
      }
    } catch (e) {
      res
        .status(401)
        .json({ status: false, message: "Token is not valid", err: e });
    }
  }
};
