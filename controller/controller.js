import { signInWithEmailAndPassword } from "firebase/auth";
import jwt from "jsonwebtoken";
import auth from "../firebaseConfig.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import Thumbnails from "../model/editedThumbnails.js";
import EditedVideosThumbnail from "../model/editedVideosImages.js";
import ShortVideosThumbnail from "../model/editedShortsImages.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function addDateTimeToFilename(filename) {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const dateTimeString = `${month}${day}_${hours}${minutes}${seconds}`;

  const fileParts = filename.split(".");
  const namePart = fileParts.slice(0, -1).join(".");
  const extensionPart = fileParts.slice(-1);

  return `${namePart}_${dateTimeString}.${extensionPart}`;
}

const loginAdmin = async (req, res) => {
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
    res.status(200).json({ message: "User logged in successfully" });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

const home = async (req, res) => {
  const thumbnails = await Thumbnails.find();
  const editedVideos = await EditedVideosThumbnail.find();
  const shorts = await ShortVideosThumbnail.find();
  res.render("index", { thumbnails, editedVideos, shorts });
};

const admin = async (req, res) => {
  try {
    const thumbnails = await Thumbnails.find();
    const editedVideos = await EditedVideosThumbnail.find();
    const shorts = await ShortVideosThumbnail.find();
    res.render("admin", { verified: true, thumbnails, editedVideos, shorts });
  } catch (error) {
    console.error("Error loading admin page", error);
  }
};

const uploadThumbnails = async (req, res) => {
  const originalFilename = req.file.originalname;
  const uniqueFilename = addDateTimeToFilename(originalFilename);
  console.log(uniqueFilename);

  const storage = getStorage();
  const storageRef = ref(storage, "thumbnails/" + uniqueFilename);
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
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      console.log("File available at", downloadURL);
      const data = {
        img_url: downloadURL,
        title: uniqueFilename,
      };
      res.status(200).json(data);
    }
  );
};

const saveThumbnails = async (req, res) => {
  const data = new Thumbnails({
    img_url: req.body.img_url,
    title: req.body.title,
  });
  data.save().then(() => {
    res.status(200).json({ message: "File saved successfully" });
  });
};

const uploadEditedShorts = async (req, res) => {
  const storage = getStorage();
  const originalFilename = req.file.originalname;
  const uniqueFilename = addDateTimeToFilename(originalFilename);
  console.log(uniqueFilename);
  const storageRef = ref(storage, "ShortVideosThumbnail/" + uniqueFilename);
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
        console.log("File available at", downloadURL);
        const data = {
          img_url: downloadURL,
          title: uniqueFilename,
          video_url: req.body.video_url,
        };
        res.status(200).json(data);
      });
    }
  );
};

const saveShorts = async (req, res) => {
  const data = new ShortVideosThumbnail({
    img_url: req.body.img_url,
    title: req.body.title,
    video_url: req.body.video_url,
  });
  data.save().then(() => {
    res.status(200).json({ message: "File saved successfully" });
  });
};

const uploadEditedVideos = async (req, res) => {
  if (req.file === undefined || req.file === null) {
    res.status(400).send("Please upload a file");
    return;
  }
  if (req.body.video_url === undefined || req.body.video_url === null) {
    res.status(400).send("Please provide a video URL");
    return;
  }

  const originalFilename = req.file.originalname;
  const uniqueFilename = addDateTimeToFilename(originalFilename);
  console.log(uniqueFilename);

  const storage = getStorage();
  const storageRef = ref(storage, "EditedVideosThumbnail/" + uniqueFilename);
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
        console.log("File available at", downloadURL);
        const data = {
          img_url: downloadURL,
          video_url: req.body.video_url,
          title: uniqueFilename,
        };
        res.status(200).json(data);
      });
    }
  );
};

const saveVideos = async (req, res) => {
  const data = new EditedVideosThumbnail({
    img_url: req.body.img_url,
    video_url: req.body.video_url,
    title: req.body.title,
  });
  data.save().then(() => {
    res.status(200).json({ message: "File saved successfully" });
  });
};

const deleteThumbnails = async (req, res) => {
  await Thumbnails.findOneAndDelete({
    title: req.body.title,
  }).then(() => {
    const storage = getStorage();
    const desertRef = ref(storage, "thumbnails/" + req.body.title);
    deleteObject(desertRef).then(() => {
      res.status(200).json({ message: "File deleted successfully" });
    });
  });
};

const deleteVideos = async (req, res) => {
  await EditedVideosThumbnail.findOneAndDelete({
    title: req.body.title,
  }).then(() => {
    const storage = getStorage();
    const desertRef = ref(storage, "EditedVideosThumbnail/" + req.body.title);
    deleteObject(desertRef).then(() => {
      res.status(200).json({ message: "File deleted successfully" });
    });
  });
};

const deleteShorts = async (req, res) => {
  console.log(req.body);
  await ShortVideosThumbnail.findOneAndDelete({
    title: req.body.title,
  }).then(() => {
    const storage = getStorage();
    const desertRef = ref(storage, "ShortVideosThumbnail/" + req.body.title);
    deleteObject(desertRef).then(() => {
      res.status(200).json({ message: "File deleted successfully" });
    });
  });
};

export {
  loginAdmin,
  home,
  admin,
  uploadThumbnails,
  uploadEditedShorts,
  uploadEditedVideos,
  deleteThumbnails,
  deleteVideos,
  deleteShorts,
  saveThumbnails,
  saveShorts,
  saveVideos,
};
