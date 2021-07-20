const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Country = require("../Modal/Location/CountryModel");
const State = require("../Modal/Location/StateModel");
const City = require("../Modal/Location/CityModel");
const adminAuth = require("../Middleware/adminAuth");
const { now } = require("mongoose");

////////////COUNTRYIES//////////////

//GET ALL  LIST
router.get("/country/get", async (req, res) => {
  try {
    const countryList = await Country.find().select(
      "name sortname status createdAt updatedAt"
    );
    res.status(200).json({ status: true, data: countryList });
  } catch (err) {
    res.status(400).json({ status: false, message: "Data not Found" });
  }
});

//GET ONE  BY ID
router.get("/country/:countryId", async (req, res) => {
  console.log(req.params.countryId);
  try {
    const postDet = await Country.findById(req.params.countryId).select(
      "name sortname status createdAt updatedAt"
    );
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/country/add", adminAuth, (req, res) => {
  const newCountry = new Country({
    sortname: req.body.sortname,
    name: req.body.name,
    status: true,
  });
  newCountry
    .save()
    .then((data) => {
      res.json({
        status: true,
        message: "Data added successfully",
        data: newCountry,
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
    const removePost = await Country.remove({
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
    const changeCountry = await Country.findOneAndUpdate(
      {
        _id: req.params.countryId,
      },
      {
        $set: udpateData,
      },
      { upsert: true }
    );
    res.json({ status: true, data: changeCountry });
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

router.post("/bulk/add/:tableName", async (req, res) => {
  try {
    const uri = process.env.DBURL;
    console.log("ej", uri, req.params.tableName, process.env.DBNAME);
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db(process.env.DBNAME);
    console.log(database);
    const nestate = database.collection(req.params.tableName);
    const options = { ordered: true };
    const docs = [
      {
        name: "Andaman and Nicobar Islands",
        country: "60f69e930f318c61a4aded1d",
        sortname: "AN",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Andhra Pradesh",
        country: "60f69e930f318c61a4aded1d",
        sortname: "AP",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Arunachal Pradesh",
        country: "60f69e930f318c61a4aded1d",
        sortname: "AR",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Assam",
        country: "60f69e930f318c61a4aded1d",
        sortname: "AS",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Bihar",
        country: "60f69e930f318c61a4aded1d",
        sortname: "BR",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Chandigarh",
        country: "60f69e930f318c61a4aded1d",
        sortname: "CH",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Chhattisgarh",
        country: "60f69e930f318c61a4aded1d",
        sortname: "CT",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Dadra and Nagar Haveli",
        country: "60f69e930f318c61a4aded1d",
        sortname: "DN",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Daman and Diu",
        country: "60f69e930f318c61a4aded1d",
        sortname: "DD",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Delhi",
        country: "60f69e930f318c61a4aded1d",
        sortname: "DL",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Goa",
        country: "60f69e930f318c61a4aded1d",
        sortname: "GA",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Gujarat",
        country: "60f69e930f318c61a4aded1d",
        sortname: "GJ",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Haryana",
        country: "60f69e930f318c61a4aded1d",
        sortname: "HR",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Himachal Pradesh",
        country: "60f69e930f318c61a4aded1d",
        sortname: "HP",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Jammu and Kashmir",
        country: "60f69e930f318c61a4aded1d",
        sortname: "JK",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Jharkhand",
        country: "60f69e930f318c61a4aded1d",
        sortname: "JH",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Karnataka",
        country: "60f69e930f318c61a4aded1d",
        sortname: "KA",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Kerala",
        country: "60f69e930f318c61a4aded1d",
        sortname: "KL",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Lakshadweep",
        country: "60f69e930f318c61a4aded1d",
        sortname: "LD",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Madhya Pradesh",
        country: "60f69e930f318c61a4aded1d",
        sortname: "MP",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Maharashtra",
        countryId: "60f69e930f318c61a4aded1d",
        sortname: "MH",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Manipur",
        country: "60f69e930f318c61a4aded1d",
        sortname: "MN",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Meghalaya",
        country: "60f69e930f318c61a4aded1d",
        sortname: "ML",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Mizoram",
        country: "60f69e930f318c61a4aded1d",
        sortname: "MZ",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Nagaland",
        country: "60f69e930f318c61a4aded1d",
        sortname: "NL",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Orissa",
        country: "60f69e930f318c61a4aded1d",
        sortname: "OR",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Pondicherry",
        country: "60f69e930f318c61a4aded1d",
        sortname: "PY",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Punjab",
        country: "60f69e930f318c61a4aded1d",
        sortname: "PB",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Rajasthan",
        country: "60f69e930f318c61a4aded1d",
        sortname: "RJ",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Sikkim",
        country: "60f69e930f318c61a4aded1d",
        sortname: "SK",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Tamil Nadu",
        country: "60f69e930f318c61a4aded1d",
        sortname: "TN",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Telangana",
        country: "60f69e930f318c61a4aded1d",
        sortname: "TG",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Tripura",
        country: "60f69e930f318c61a4aded1d",
        sortname: "TR",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Uttarakhand",
        country: "60f69e930f318c61a4aded1d",
        sortname: "UT",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "West Bengal",
        country: "60f69e930f318c61a4aded1d",
        sortname: "WB",
        status: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
    await nestate.insertMany(docs, options);

    // await newstate
    //   .save()
    //   .then((data) => {
    //     res.json({
    //       status: true,
    //       message: "Data added successfully",
    //       data: newstate,
    //     });
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     if (err.code === 11000) {
    //       res.json({
    //         status: false,
    //         message: "Validation error `name` should be unique",
    //       });
    //     } else {
    //       res.json({ status: false, message: "Data not added" });
    //     }
    //   });
  } catch (err) {
    res.send({ err: err, message: "Data is not added" });
  }
});

module.exports = router;
