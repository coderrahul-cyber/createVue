const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // checking for file path for dp and uploads
    if (file.fieldname === "dp") {
      cb(null, "./public/images/dp");
    } else if (file.fieldname === "fileu") {
      cb(null, "./public/images/uploads");
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
  filename: (req, file, cb) => {
    const unique = uuidv4();
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
