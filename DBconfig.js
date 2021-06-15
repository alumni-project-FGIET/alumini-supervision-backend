const mongoose = require("mongoose");

process.env.SUPPRESS_NO_CONFIG_WARNING = "Done";

const connection = async () => {
  const conn = await mongoose.connect("mongodb+srv://user:Alumni2021@alumni.ctgbh.mongodb.net/myAlumni", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connection;
