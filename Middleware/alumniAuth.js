const jwt = require("jsonwebtoken");
const Admin = require("../Modal/AdminModel");
const AlumniModel = require("../Modal/AlumniModel");

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
      console.log(bearerHeader);
      const decoded = jwt.verify(bearerHeader, process.env.JWT);
      userEmail = decoded.user.email;
      req.user = decoded;

      const alumniData = await AlumniModel.findOne({ email: userEmail });

      if (alumniData) {
        next();
      } else {
        const adminData = await Admin.findOne({ email: userEmail });
        if (adminData) {
          next();
        }
      }
    } catch (e) {
      res
        .status(401)
        .json({ status: false, message: "Token is not valid", err: e });
    }
  }
};
