import express from "express";
import { configDotenv } from "dotenv";
import morgan from "morgan";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import path from "path";
import jwt from "jsonwebtoken";
import firebaseConfig from "./firebaseConfig.js";
import fs from "fs";
import multer, { memoryStorage } from "multer";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

configDotenv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var DATA_FILE_PATH = path.join(__dirname, "data.json");

const server = express();
server.use(morgan("dev"));
server.use(cookieParser());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.set("views", path.join(__dirname, "views"));
server.use(express.static("views"));
server.set("view engine", "ejs");

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

server.post("/loginAdmin", async (req, res) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      req.body.email,
      req.body.password
    );
    const user = userCredential.user;
    console.log("User logged in successfully:", user.email);
    const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, {
      expiresIn: "36h",
    });
    res.cookie("token", token, { httpOnly: true }); // Set cookie with the token
    fs.readFile(DATA_FILE_PATH, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading data file:", err);
        res.status(500).render("admin", { verified: false });
        return;
      }
      const dataJSON = JSON.parse(data);
      res.status(200).render("admin", { data: dataJSON, verified: true });
    });
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Error logging in:", errorCode, errorMessage);
    res.status(401).render("admin", { verified: false }); // Send error response
  }
});

server.get("/", (req, res) => {
  fs.readFile(DATA_FILE_PATH, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading data file");
      return;
    }
    const dataJSON = JSON.parse(data);
    res.render("index", { data: dataJSON });
  });
});

server.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "resume.html"));
});

server.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "contact.html"));
});

const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Read token from cookies
  if (!token) {
    return res.status(404).render("admin", { verified: false });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).render("admin", { verified: false });
  }
  next();
};

server.get("/admin", verifyToken, (req, res) => {
  fs.readFile(DATA_FILE_PATH, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading data file:", err);
      res.status(500).render("admin", { verified: false });
      return;
    }
    const dataJSON = JSON.parse(data);
    res.render("admin", { data: dataJSON, verified: true });
  });
});

const upload = multer({ storage: memoryStorage() });

server.post("/uploadThumbnails", upload.single("file"), (req, res) => {
  const storage = getStorage();
  const storageRef = ref(storage, "thumbnails/" + req.file.originalname);
  const metadata = {
    contentType: req.file.mimetype,
  };

  const uploadTask = uploadBytesResumable(
    storageRef,
    req.file.buffer,
    metadata
  );

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
      switch (snapshot.state) {
        case "paused":
          console.log("Upload is paused");
          break;
        case "running":
          console.log("Upload is running");
          break;
      }
    },
    (error) => {
      console.error("Upload failed:", error);
      res.status(500).send("Upload failed");
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        fs.readFile(DATA_FILE_PATH, "utf8", (err, data) => {
          if (err) {
            console.error("Error reading data file:", err);
            res.status(500).send("Error reading data file");
            return;
          }
          const dataJSON = JSON.parse(data);
          let thumbnailsObj = null;
          for (let i = 0; i < dataJSON.length; i++) {
            if (dataJSON[i].images_type === "thumbnails") {
              thumbnailsObj = dataJSON[i];
              break;
            }
          }
          thumbnailsObj.url.push({
            img_url: downloadURL,
            title: req.file.originalname,
          });
          const updatedJsonData = JSON.stringify(dataJSON, null, 2);

          fs.writeFile(DATA_FILE_PATH, updatedJsonData, (err) => {
            if (err) {
              console.error("Error writing data file:", err);
              res.status(500).send("Error writing data file");
              return;
            }
            console.log("File has been updated successfully");
            res.send({ downloadURL });
          });
        });
      });
    }
  );
});

server.post("/uploadEditedVideos", upload.single("file"), (req, res) => {
  if (req.file === undefined || req.file === null) {
    res.status(400).send("Please upload a file");
    return;
  }
  if (req.body.video_url === undefined || req.body.video_url === null) {
    res.status(400).send("Please provide a video URL");
    return;
  }
  const storage = getStorage();
  const storageRef = ref(
    storage,
    "EditedVideosThumbnail/" + req.file.originalname
  );
  const metadata = {
    contentType: req.file.mimetype,
  };

  const uploadTask = uploadBytesResumable(
    storageRef,
    req.file.buffer,
    metadata
  );

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
      switch (snapshot.state) {
        case "paused":
          console.log("Upload is paused");
          break;
        case "running":
          console.log("Upload is running");
          break;
      }
    },
    (error) => {
      console.error("Upload failed:", error);
      res.status(500).send("Upload failed");
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        fs.readFile(DATA_FILE_PATH, "utf8", (err, data) => {
          if (err) {
            console.error("Error reading data file:", err);
            res.status(500).send("Error reading data file");
            return;
          }
          const dataJSON = JSON.parse(data);
          let thumbnailsObj = null;
          for (let i = 0; i < dataJSON.length; i++) {
            if (dataJSON[i].images_type === "EditedVideosThumbnail") {
              thumbnailsObj = dataJSON[i];
              break;
            }
          }
          thumbnailsObj.url.push({
            img_url: downloadURL,
            title: req.file.originalname,
            video_url: req.body.video_url,
          });

          const updatedJsonData = JSON.stringify(dataJSON, null, 2);

          fs.writeFile(DATA_FILE_PATH, updatedJsonData, (err) => {
            if (err) {
              console.error("Error writing data file:", err);
              res.status(500).send("Error writing data file");
              return;
            }
            console.log("File has been updated successfully");
            res.send({ downloadURL });
          });
        });
      });
    }
  );
});

server.post("/uploadEditedShorts", upload.single("file"), (req, res) => {
  const storage = getStorage();
  const storageRef = ref(
    storage,
    "ShortVideosThumbnail/" + req.file.originalname
  );
  const metadata = {
    contentType: req.file.mimetype,
  };

  const uploadTask = uploadBytesResumable(
    storageRef,
    req.file.buffer,
    metadata
  );

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
      switch (snapshot.state) {
        case "paused":
          console.log("Upload is paused");
          break;
        case "running":
          console.log("Upload is running");
          break;
      }
    },
    (error) => {
      console.error("Upload failed:", error);
      res.status(500).send("Upload failed");
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        fs.readFile(DATA_FILE_PATH, "utf8", (err, data) => {
          if (err) {
            console.error("Error reading data file:", err);
            res.status(500).send("Error reading data file");
            return;
          }
          const dataJSON = JSON.parse(data);
          let thumbnailsObj = null;
          for (let i = 0; i < dataJSON.length; i++) {
            if (dataJSON[i].images_type === "ShortVideosThumbnail") {
              thumbnailsObj = dataJSON[i];
              break;
            }
          }
          thumbnailsObj.url.push({
            img_url: downloadURL,
            title: req.file.originalname,
            video_url: req.body.video_url,
          });

          const updatedJsonData = JSON.stringify(dataJSON, null, 2);

          fs.writeFile(DATA_FILE_PATH, updatedJsonData, (err) => {
            if (err) {
              console.error("Error writing data file:", err);
              res.status(500).send("Error writing data file");
              return;
            }
            console.log("File has been updated successfully");
            res.send({ downloadURL });
          });
        });
      });
    }
  );
});

server.post("/deleteThumbnails", (req, res) => {
  const storage = getStorage();
  const desertRef = ref(storage, "thumbnails/" + req.body.FileName);
  deleteObject(desertRef).then(() => {
    fs.readFile(DATA_FILE_PATH, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading data file:", err);
        res.status(500).send("Error reading data file");
        return;
      }
      const dataJSON = JSON.parse(data);
      let thumbnailsObj = null;
      for (let i = 0; i < dataJSON.length; i++) {
        if (dataJSON[i].images_type === "thumbnails") {
          thumbnailsObj = dataJSON[i];
          break;
        }
      }
      const updatedData = thumbnailsObj.url
        .map((item) => {
          if (item.title !== req.body.FileName) {
            return item;
          }
        })
        .filter((item) => {
          return item !== undefined;
        });
      thumbnailsObj.url = updatedData;
      const updatedJsonData = JSON.stringify(dataJSON, null, 2);

      fs.writeFile(DATA_FILE_PATH, updatedJsonData, (err) => {
        if (err) {
          console.error("Error writing data file:", err);
          res.status(500).send("Error writing data file");
          return;
        }
        console.log("File has been updated successfully");
        res.send("Video deleted successfully");
      });
    });
  });
});

server.post("/deleteShorts", (req, res) => {
  const storage = getStorage();
  const desertRef = ref(storage, "ShortVideosThumbnail/" + req.body.FileName);
  deleteObject(desertRef).then(() => {
    fs.readFile(DATA_FILE_PATH, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading data file:", err);
        res.status(500).send("Error reading data file");
        return;
      }
      const dataJSON = JSON.parse(data);
      let thumbnailsObj = null;
      for (let i = 0; i < dataJSON.length; i++) {
        if (dataJSON[i].images_type === "ShortVideosThumbnail") {
          thumbnailsObj = dataJSON[i];
          break;
        }
      }
      const updatedData = thumbnailsObj.url
        .map((item) => {
          if (item.title !== req.body.FileName) {
            return item;
          }
        })
        .filter((item) => {
          return item !== undefined;
        });
      thumbnailsObj.url = updatedData;
      const updatedJsonData = JSON.stringify(dataJSON, null, 2);

      fs.writeFile(DATA_FILE_PATH, updatedJsonData, (err) => {
        if (err) {
          console.error("Error writing data file:", err);
          res.status(500).send("Error writing data file");
          return;
        }
        console.log("File has been updated successfully");
        res.send("Video deleted successfully");
      });
    });
  });
});

server.post("/deleteVideos", (req, res) => {
  const storage = getStorage();
  const desertRef = ref(storage, "EditedVideosThumbnail/" + req.body.FileName);
  deleteObject(desertRef).then(() => {
    fs.readFile(DATA_FILE_PATH, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading data file:", err);
        res.status(500).send("Error reading data file");
        return;
      }
      const dataJSON = JSON.parse(data);
      let thumbnailsObj = null;
      for (let i = 0; i < dataJSON.length; i++) {
        if (dataJSON[i].images_type === "EditedVideosThumbnail") {
          thumbnailsObj = dataJSON[i];
          break;
        }
      }
      const updatedData = thumbnailsObj.url
        .map((item) => {
          if (item.title !== req.body.FileName) {
            return item;
          }
        })
        .filter((item) => {
          return item !== undefined;
        });
      thumbnailsObj.url = updatedData;
      const updatedJsonData = JSON.stringify(dataJSON, null, 2);

      fs.writeFile(DATA_FILE_PATH, updatedJsonData, (err) => {
        if (err) {
          console.error("Error writing data file:", err);
          res.status(500).send("Error writing data file");
          return;
        }
        console.log("File has been updated successfully");
        res.send("Video deleted successfully");
      });
    });
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
