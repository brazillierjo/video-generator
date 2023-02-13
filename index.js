const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const ffmpeg = require("fluent-ffmpeg");
const cors = require("cors");

// Set up Multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.post("/process", upload.array("files"), (req, res) => {
  const video = req.files[0].path;
  const audio = req.files[1].path;
  const time = req.body.time;

  const command = ffmpeg()
    .input(video)
    .input(audio)
    .outputOptions(`-t ${time}`)
    .output("output.mp4")
    .on("progress", function (progress) {
      console.log("Processing: " + progress.percent + "% done");
    })
    .on("end", function () {
      console.log("Finished processing");
      res.send("/output.mp4");
    })
    .run();
});

app.get("/test", (req, res) => {
  res.status(200).send("API is working");
});

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
});
