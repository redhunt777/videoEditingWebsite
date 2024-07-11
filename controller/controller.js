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
import { __dirname } from "../server.js";

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

const about = async (req, res) => {
  res.sendFile(path.join(__dirname, "views", "resume.html"));
};

const contact = async (req, res) => {
  res.sendFile(path.join(__dirname, "views", "contact.html"));
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
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      console.log("File available at", downloadURL);

      const data = new Thumbnails({
        img_url: downloadURL,
        title: req.file.originalname,
      });
      data.save().then(() => {
        res.status(200).json({ message: "File uploaded successfully" });
      });
    }
  );
};

const uploadEditedShorts = async (req, res) => {
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
        console.log("File available at", downloadURL);
        const data = new ShortVideosThumbnail({
          img_url: downloadURL,
          title: req.file.originalname,
          video_url: req.body.video_url,
        });

        data.save().then(() => {
          res.status(200).json({ message: "File uploaded successfully" });
        });
      });
    }
  );
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
        console.log("File available at", downloadURL);
        const data = new EditedVideosThumbnail({
          img_url: downloadURL,
          video_url: req.body.video_url,
          title: req.file.originalname,
        });

        data.save().then(() => {
          res.status(200).json({ message: "File uploaded successfully" });
        });
      });
    }
  );
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
  about,
  contact,
  admin,
  uploadThumbnails,
  uploadEditedShorts,
  uploadEditedVideos,
  deleteThumbnails,
  deleteVideos,
  deleteShorts,
};
