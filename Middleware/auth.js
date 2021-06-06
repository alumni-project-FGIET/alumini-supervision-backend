const jwt = require("jsonwebtoken");
const Admin = require("../Modal/AdminModel");
const AlumniModel = require("../Modal/AlumniModel");
const User = require("../Modal/UserModel");

module.exports = async (req, res, next) => {
  const bearerHeader = req.header("authorization");
  if (!bearerHeader)
    return res
      .status(401)
      .json({ status: false, message: "No token, authorization denied" });
  else {
    try {
      const decoded = jwt.verify(bearerHeader, process.env.JWT);
      userEmail = decoded.user.email;
      req.user = decoded;

      const userData = await User.findOne({ email: userEmail });

      if (userData) next();
      else {
        const adminData = await Admin.findOne({ email: userEmail });
        if (adminData) next();
        else {
          const alumniData = await AlumniModel.findOne({ email: userEmail });
          if (alumniData) next();
        }
      }
    } catch (e) {
      res
        .status(401)
        .json({ status: false, message: "Token is not valid", err: e });
    }
  }
};
