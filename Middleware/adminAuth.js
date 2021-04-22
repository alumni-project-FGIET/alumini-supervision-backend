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
      .json({ status: false, msg: "No token, authorization denied" });
  //    verify token
  else {
    try {
      // const bearer= bearerHeader.split(' ');
      //         const bearerToken = bearer[1];
      console.log(bearerHeader);
      const decoded = jwt.verify(bearerHeader, process.env.JWT);
      userEmail = decoded.user.email;
      console.log(decoded)
      const alumniData = await AlumniModel.findOne({ email: userEmail });
      if (alumniData) {
        next();
        console.log('done');
      } else {
        const adminData = await Admin.findOne({ email: userEmail });
        if (adminData) {
          next();
          console.log('done');
        }
     }
    } catch (e) {
      res
        .status(401)
        .json({ status: false, msg: "Token is not valid", err: e });
    }
  }
};
