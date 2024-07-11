function handleDeleteEditedThumbnails(title) {
  axios
    .delete("/delete/thumbnails", { data: { title } }) // Note the use of 'data' property
    .then((response) => {
      location.reload();
      console.log(response);
    })
    .catch((error) => {
      alert("Error deleting thumbnail:", error);
    });
}

window.handleDeleteEditedThumbnails = handleDeleteEditedThumbnails;

function handleDeleteEditedShorts(title) {
  axios
    .delete("/delete/shorts", { data: { title } })
    .then((response) => {
      location.reload();
    })
    .catch((error) => {
      alert("Error deleting video:");
    });
}

window.handleDeleteEditedShorts = handleDeleteEditedShorts;

function handleDeleteEditedVideos(title) {
  axios
    .delete("/delete/videos", { data: { title } })
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
        .post("/uploads/EditedVideos", formData)
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
        .post("/uploads/EditedShorts", formData)
        .then((response) => {
          location.reload();
        })
        .catch((error) => {
          alert("Error uploading short");
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
        .post("/uploads/Thumbnails", formData)
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
