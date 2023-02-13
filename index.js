const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const ffmpeg = require("fluent-ffmpeg");

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

// Route for handling file uploads
app.post("/process", upload.array("files", 2), (req, res) => {
  const videoFile = req.files[0];
  const audioFile = req.files[1];
  const time = req.body.time;

  // Paths of the input files
  const videoFilePath = path.join(__dirname, "uploads", videoFile.filename);
  const audioFilePath = path.join(__dirname, "uploads", audioFile.filename);

  // Path of the output file
  const outputFilePath = path.join(__dirname, "uploads", "output.mp4");

  // Use FFmpeg to process the video and audio files
  ffmpeg()
    .input(videoFilePath)
    .input(audioFilePath)
    .complexFilter([
      {
        filter: "amix",
        options: { inputs: 2, duration: "longest" },
      },
    ])
    .outputOptions("-c:v libx264", "-c:a aac", "-b:a 192k")
    .output(outputFilePath)
    .on("end", function () {
      console.log("File processing finished!");
      res.send("Video processed successfully!");
    })
    .on("error", function (err) {
      console.error("An error occurred: " + err.message);
      res.status(500).send("An error occurred while processing the video.");
    })
    .run();
});

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
