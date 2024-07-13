const firebaseConfig = {
  apiKey: "AIzaSyDtSlQneJz4h6HPbpYa5MtGXaSuQXBDg4Q",
  authDomain: "videoeditingportfolio-af3d5.firebaseapp.com",
  databaseURL:
    "https://videoeditingportfolio-af3d5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "videoeditingportfolio-af3d5",
  storageBucket: "videoeditingportfolio-af3d5.appspot.com",
  messagingSenderId: "611866389562",
  appId: "1:611866389562:web:694015818198e84675d903",
  measurementId: "G-QCVNM38EV0",
};

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

const app = firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

document
  .getElementById("uploadVideos")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const file = document.getElementById("formFileVideo").files[0];
    const originalFilename = file.name;
    const uniqueFilename = addDateTimeToFilename(originalFilename);
    const url = document.getElementById("basic_url_video").value;

    if (file && url) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("video_url", url);

      let storageRef = firebase
        .storage()
        .ref("EditedVideosThumbnail/" + uniqueFilename);
      let uploadTask = storageRef.put(file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          let progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Error uploading video:", error);
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            const data = {
              video_url: url,
              img_url: downloadURL,
              title: uniqueFilename,
            };
            axios.post("/uploads/saveVideos", data).then((response) => {
              location.reload();
            });
          });
        }
      );
    }
  });

document
  .getElementById("uploadShorts")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const file = document.getElementById("formFileShorts").files[0];
    const url = document.getElementById("basic_url_short").value;
    const originalFilename = file.name;
    const uniqueFilename = addDateTimeToFilename(originalFilename);

    let storageRef = firebase.storage().ref("EditedShorts/" + uniqueFilename);
    let uploadTask = storageRef.put(file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("Error uploading short:", error);
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          const data = {
            video_url: url,
            img_url: downloadURL,
            title: uniqueFilename,
          };
          axios.post("/uploads/saveShorts", data).then((response) => {
            location.reload();
          });
        });
      }
    );
  });

document
  .getElementById("uploadThumbnails")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const file = document.getElementById("formFileThumbnail").files[0];
    const originalFilename = file.name;
    const uniqueFilename = addDateTimeToFilename(originalFilename);

    let storageRef = firebase.storage().ref("thumbnails/" + uniqueFilename);
    let uploadTask = storageRef.put(file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("Error uploading thumbnail:", error);
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          const data = {
            img_url: downloadURL,
            title: uniqueFilename,
          };
          axios.post("/uploads/saveThumbnails", data).then((response) => {
            location.reload();
          });
        });
      }
    );
  });
