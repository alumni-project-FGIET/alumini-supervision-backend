var express = require("express");
var app = express();
var http = require("http");
var bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const connection = require("./DBconfig");
const college = require("./Routes/collegeApis");
const country = require("./Routes/loactionApis");
const user = require("./Routes/userApis");
const admin = require("./Routes/adminApis");
const alumni = require("./Routes/alumniApis");
const upload = require("./Routes/DataUploads");
const postApi = require("./Routes/postAPis");
const feed = require("./Routes/connectionApis");
const event = require("./Routes/eventApis");
const morgan = require("morgan");
const fs = require("fs");

require("dotenv").config();

const port = process.env.PORT || 5000;
const server = http.createServer(app);
connection();

app.use(cors());
app.use(express.json());
var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});

// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.static(path.join(__dirname, "./uploads/")));
app.get("/test", (req, res) => {
  res.send(
    "Alumni Supervision App for fgiet students APIs runs successfully !!"
  );
});
app.use("/college", college);
app.use("/location", country);
app.use("/user", user);
app.use("/admin", admin);
app.use("/alumni", alumni);
app.use("/connect", feed);
app.use("/post", postApi);
app.use("/event", event);
app.use("/", upload);
server.listen(port, function () {
  console.log("listen to server .....", port);
});
