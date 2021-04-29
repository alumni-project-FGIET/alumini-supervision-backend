const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const router = express.Router();
require("dotenv").config();
const multer = require("multer");
const auth = require("../Middleware/auth");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWSACCESSKEYID,
  secretAccessKey: process.env.AWSSECERETKEY,
});

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const upload = multer({ storage }).array("media");

router.post("/uploadMedia", auth, upload, (req, res) => {
  s3.createBucket(function () {
    const filesarray = req.files;
    //Where you want to store your file
    var ResponseData = [];
    filesarray.map((item, i) => {
      console.log(item);
      let myFile = item.originalname.split(".");
      const fileType = myFile[myFile.length - 1];
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}.${fileType}`,
        Body: item.buffer,
      };
      console.log(params);

      s3.upload(params, (error, data) => {
        if (error) {
          res.json({ error: error, status: false });
        } else {
          ResponseData.push(data);
          if (ResponseData.length == filesarray.length) {
            res.json({
              status: true,
              Message: "File Uploaded  SuceesFully",
              Data: ResponseData,
            });
          }
        }
      });
    });
  });
});

module.exports = router;
