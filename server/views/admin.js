function handleDeleteEditedThumbnails(FileName) {
  axios
    .post("/deleteThumbnails", { FileName })
    .then((response) => {
      location.reload();
    })
    .catch((error) => {
      alert("Error deleting video:");
    });
}
window.handleDeleteEditedThumbnails = handleDeleteEditedThumbnails;

function handleDeleteEditedShorts(FileName) {
  axios
    .post("/deleteShorts", { FileName })
    .then((response) => {
      location.reload();
    })
    .catch((error) => {
      alert("Error deleting video:");
    });
}

window.handleDeleteEditedShorts = handleDeleteEditedShorts;

function handleDeleteEditedVideos(FileName) {
  axios
    .post("/deleteVideos", { FileName })
    .then((response) => {
      location.reload();
    })
    .catch((error) => {
      alert("Error deleting video:");
    });
}
window.handleDeleteEditedVideos = handleDeleteEditedVideos;

document
  .getElementById("uploadVideos")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const file = document.getElementById("formFileVideo").files[0];
    const url = document.getElementById("basic_url_video").value;

    if (file && url) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("video_url", url);

      axios
        .post("/uploadEditedVideos", formData)
        .then((response) => {
          location.reload();
        })
        .catch((error) => {
          alert("Error uploading video:");
        });
    } else {
      alert("Please select a file or Url to upload");
    }
  });

document
  .getElementById("uploadShorts")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const file = document.getElementById("formFileShorts").files[0];
    const url = document.getElementById("basic_url_short").value;
    console.log(file, url);
    if (file && url) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("video_url", url);

      axios
        .post("/uploadEditedShorts", formData)
        .then((response) => {
          location.reload();
        })
        .catch((error) => {
          alert("Error uploading short:");
        });
    } else {
      alert("Please select a file or Url to upload");
    }
  });

document
  .getElementById("uploadThumbnails")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const file = document.getElementById("formFileThumbnail").files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      axios
        .post("/uploadThumbnails", formData)
        .then((response) => {
          location.reload();
        })
        .catch((error) => {
          alert("Error uploading thumbnail:");
        });
    } else {
      alert("Please select a file or Url to upload");
    }
  });
