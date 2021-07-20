const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const country = require("../Modal/Location/countryModel");
const State = require("../Modal/Location/StateModel");
const City = require("../Modal/Location/CityModel");
const adminAuth = require("../Middleware/adminAuth");
const { ObjectId } = require("mongodb");

//GET ALL  LIST
router.get("/country/get", async (req, res) => {
  try {
    const countryList = await country
      .find()
      .select("name sortname status createdAt updatedAt");
    res.status(200).json({ status: true, data: countryList });
  } catch (err) {
    res.status(400).json({ status: false, message: "Data not Found" });
  }
});

//GET ONE  BY ID
router.get("/country/:countryId", async (req, res) => {
  console.log(req.params.countryId);
  try {
    const postDet = await country
      .findById(req.params.countryId)
      .select("name sortname status createdAt updatedAt");
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/country/add", adminAuth, (req, res) => {
  const newcountry = new country({
    sortname: req.body.sortname,
    name: req.body.name,
    status: true,
  });
  newcountry
    .save()
    .then((data) => {
      res.json({
        status: true,
        message: "Data added successfully",
        data: newcountry,
      });
    })
    .catch((err) => {
      console.log(err);
      if (err.code === 11000) {
        res.json({
          status: false,
          message: "Validation error `name` should be unique",
        });
      } else {
        res.json({ status: false, message: "Data not added" });
      }
    });
});
//ADD

//DELETE THE  BY ID
router.delete("/country/delete/:countryId", adminAuth, async (req, res) => {
  console.log(req.params.countryId);
  try {
    const removePost = await country.remove({
      _id: req.params.countryId,
    });
    res.json(removePost);
  } catch (err) {
    res.json({ message: err });
  }
});

router.patch("/country/update/:countryId", adminAuth, async (req, res) => {
  console.log(req.params.countryId);
  try {
    const udpateData = req.body;
    const changecountry = await country.findOneAndUpdate(
      {
        _id: req.params.countryId,
      },
      {
        $set: udpateData,
      },
      { upsert: true }
    );
    res.json({ status: true, data: changecountry });
  } catch (err) {
    res.json({ message: err });
  }
});

//////////////STATES//////////  ////

//GET ALL  LIST
router.get("/state/get", async (req, res) => {
  try {
    stateList = await State.find()
      .select("name sortname country status createdAt updatedAt")
      .populate("country", "name sortname");
    res.json({ status: true, data: stateList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

//GET ONE  BY ID
router.get("/state/:stateId", async (req, res) => {
  console.log(req.params.stateId);
  try {
    const postDet = await State.findById(req.params.stateId)
      .select("name sortname country status createdAt updatedAt")
      .populate("country", "name sortname");
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/state/add", adminAuth, async (req, res) => {
  try {
    if (req.body.countryId) {
      const newstate = new State({
        sortname: req.body.sortname,
        name: req.body.name,
        status: true,
        country: req.body.countryId,
      });

      await newstate
        .save()
        .then((data) => {
          res.json({
            status: true,
            message: "Data added successfully",
            data: newstate,
          });
        })
        .catch((err) => {
          console.log(err);
          if (err.code === 11000) {
            res.json({
              status: false,
              message: "Validation error `name` should be unique",
            });
          } else {
            res.json({ status: false, message: "Data not added" });
          }
        });
    } else {
      res.json({ status: false, message: "countryId should not be null" });
    }
  } catch (err) {
    console.log(req.body);
    res.send({ err: err });
  }
});

//DELETE THE  BY ID
router.delete("/state/delete/:stateId", adminAuth, async (req, res) => {
  console.log(req.params.stateId);
  try {
    const removePost = await State.remove({
      _id: req.params.stateId,
    });
    res.json(removePost);
  } catch (err) {
    res.json({ message: err });
  }
});

router.patch("/state/update/:stateId", adminAuth, async (req, res) => {
  console.log(req.params.stateId);
  try {
    const udpateData = req.body;
    const changeState = await State.findOneAndUpdate(
      {
        _id: req.params.stateId,
      },
      {
        $set: udpateData,
      },
      { upsert: true }
    );
    res.json({ status: true, data: changeState });
  } catch (err) {
    res.json({ message: err });
  }
});

//////////////CITY//////////  ////

//GET ALL  LIST
router.get("/city/get", async (req, res) => {
  try {
    cityList = await City.find()
      .select("name state status createdAt updatedAt")
      .populate({
        path: "state",
        select: "name",
        populate: {
          path: "country",
          select: "name",
        },
      });
    res.json({ status: true, data: cityList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

router.get("/city/:cityId", async (req, res) => {
  console.log(req.params.cityId);
  try {
    const postDet = await City.findById(req.params.cityId).populate({
      path: "state",
      select: "name status",
      populate: {
        path: "country",
        select: "name",
      },
    });
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/city/add", adminAuth, async (req, res) => {
  try {
    if (req.body.stateId) {
      const newCity = new City({
        name: req.body.name,
        status: true,
        state: req.body.stateId,
      });

      await newCity
        .save()
        .then((data) => {
          res.json({
            status: true,
            message: "Data added successfully",
            data: newCity,
          });
        })
        .catch((err) => {
          console.log(err);
          if (err.code === 11000) {
            res.json({
              status: false,
              message: "Validation error `name` should be unique",
            });
          } else {
            res.json({ status: false, message: "Data not added" });
          }
        });
    } else {
      res.json({ status: false, message: "StateId should not be null" });
    }
  } catch (err) {
    console.log(req.body);
    res.send({ err: "error" });
  }
});

//DELETE THE  BY ID
router.delete("/city/delete/:cityId", adminAuth, async (req, res) => {
  console.log(req.params.cityId);
  try {
    const removePost = await City.remove({
      _id: req.params.cityId,
    });
    res.json(removePost);
  } catch (err) {
    res.json({ message: err });
  }
});

router.patch("/city/update/:cityId", adminAuth, async (req, res) => {
  console.log(req.params.cityId);
  try {
    const udpateData = req.body;
    const changeCity = await City.findOneAndUpdate(
      {
        _id: req.params.cityId,
      },
      {
        $set: udpateData,
      },
      { upsert: true }
    );
    res.json({ status: true, data: changeCity });
  } catch (err) {
    res.json({ message: err });
  }
});

//bulk

router.post("/bulk/add", async (req, res) => {
  try {
    // await client.connect();
    // const database = client.db("myAlumni");
    // const nestate = database.collection("states");
    // const options = { ordered: true };
    // const docs = [
    //   {
    //     name: "Andaman and Nicobar Islands",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "AN",
    //     status: true,
    //   },
    //   {
    //     name: "Andhra Pradesh",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "AP",
    //     status: true,
    //   },
    //   {
    //     name: "Arunachal Pradesh",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "AR",
    //     status: true,
    //   },
    //   {
    //     name: "Assam",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "AS",
    //     status: true,
    //   },
    //   {
    //     name: "Bihar",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "BR",
    //     status: true,
    //   },
    //   {
    //     name: "Chandigarh",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "CH",
    //     status: true,
    //   },
    //   {
    //     name: "Chhattisgarh",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "CT",
    //     status: true,
    //   },
    //   {
    //     name: "Dadra and Nagar Haveli",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "DN",
    //     status: true,
    //   },
    //   {
    //     name: "Daman and Diu",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "DD",
    //     status: true,
    //   },
    //   {
    //     name: "Delhi",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "DL",
    //     status: true,
    //   },
    //   {
    //     name: "Goa",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "GA",
    //     status: true,
    //   },
    //   {
    //     name: "Gujarat",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "GJ",
    //     status: true,
    //   },
    //   {
    //     name: "Haryana",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "HR",
    //     status: true,
    //   },
    //   {
    //     name: "Himachal Pradesh",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "HP",
    //     status: true,
    //   },
    //   {
    //     name: "Jammu and Kashmir",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "JK",
    //     status: true,
    //   },
    //   {
    //     name: "Jharkhand",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "JH",
    //     status: true,
    //   },
    //   {
    //     name: "Karnataka",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "KA",
    //     status: true,
    //   },
    //   {
    //     name: "Kerala",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "KL",
    //     status: true,
    //   },
    //   {
    //     name: "Lakshadweep",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "LD",
    //     status: true,
    //   },
    //   {
    //     name: "Madhya Pradesh",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "MP",
    //     status: true,
    //   },
    //   {
    //     name: "Maharashtra",
    //     countryId: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "MH",
    //     status: true,
    //   },
    //   {
    //     name: "Manipur",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "MN",
    //     status: true,
    //   },
    //   {
    //     name: "Meghalaya",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "ML",
    //     status: true,
    //   },
    //   {
    //     name: "Mizoram",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "MZ",
    //     status: true,
    //   },
    //   {
    //     name: "Nagaland",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "NL",
    //     status: true,
    //   },
    //   {
    //     name: "Orissa",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "OR",
    //     status: true,
    //   },
    //   {
    //     name: "Pondicherry",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "PY",
    //     status: true,
    //   },
    //   {
    //     name: "Punjab",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "PB",
    //     status: true,
    //   },
    //   {
    //     name: "Rajasthan",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "RJ",
    //     status: true,
    //   },
    //   {
    //     name: "Sikkim",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "SK",
    //     status: true,
    //   },
    //   {
    //     name: "Tamil Nadu",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "TN",
    //     status: true,
    //   },
    //   {
    //     name: "Telangana",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "TG",
    //     status: true,
    //   },
    //   {
    //     name: "Tripura",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "TR",
    //     status: true,
    //   },
    //   {
    //     name: "Uttarakhand",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "UT",
    //     status: true,
    //   },
    //   {
    //     name: "West Bengal",
    //     country: ObjectId("60f69e930f318c61a4aded1d"),
    //     sortname: "WB",
    //     status: true,
    //   },
    // ];
    const cites = [
      {
        name: "Lucknow",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Kanpur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Firozabad",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Agra",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Meerut",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Varanasi",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Allahabad",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Amroha",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Moradabad",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Aligarh",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Saharanpur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      { status: true, state: ObjectId("60f69f55508c224b88f51f4e") },
      {
        name: "Loni",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Jhansi",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Shahjahanpur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Rampur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Modinagar",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Hapur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Etawah",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sambhal",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Orai",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Bahraich",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Unnao",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Lakhimpur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sitapur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Lalitpur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Pilibhit",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Chandausi",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Hardoi ",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Azamgarh",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Khair",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sultanpur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Tanda",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Nagina",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Shamli",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Najibabad",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Shikohabad",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sikandrabad",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Shahabad, Hardoi",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Pilkhuwa",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Renukoot",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Vrindavan",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Ujhani",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Laharpur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Tilhar",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sahaswan",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Rath",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sherkot",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Kalpi",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Tundla",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sandila",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Nanpara",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sardhana",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Nehtaur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Seohara",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Padrauna",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Mathura",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Thakurdwara",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Nawabganj",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Siana",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Noorpur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sikandra Rao",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Puranpur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Rudauli",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Thana Bhawan",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Palia Kalan",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      { status: true, state: ObjectId("60f69f55508c224b88f51f4e") },
      {
        name: "Nautanwa",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Zamania",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Shikarpur, Bulandshahr",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Naugawan Sadat",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Fatehpur Sikri",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Shahabad, Rampur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Robertsganj",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Utraula",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sadabad",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Rasra",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Lar",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Lal Gopalganj Nindaura",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sirsaganj",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Pihani",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Shamsabad, Agra",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Rudrapur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Soron",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "SUrban Agglomerationr",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Samdhan",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sahjanwa",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Rampur Maniharan",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sumerpur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Shahganj",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Tulsipur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Tirwaganj",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "PurqUrban Agglomerationzi",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Shamsabad, Farrukhabad",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Warhapur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Powayan",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sandi",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Achhnera",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Naraura",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Nakur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sahaspur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Safipur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Reoti",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sikanderpur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      { status: true, state: ObjectId("60f69f55508c224b88f51f4e") },
      {
        name: "Sirsi",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Purwa",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Parasi",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Lalganj",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Phulpur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Shishgarh",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Sahawar",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Samthar",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Pukhrayan",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Obra",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Niwai",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
      {
        name: "Mirzapur",
        status: true,
        state: ObjectId("60f69f55508c224b88f51f4e"),
      },
    ];
    await City.insertMany(cites);

    // await nestate
    //   .insertMany(docs, options)
    //   .then((data) => {
    //     res.json({
    //       status: true,
    //       message: "Data added successfully",
    //     });
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  } catch (err) {
    res.send({ err: err, message: "Data is not added" });
  }
});

module.exports = router;
