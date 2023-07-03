const cloudinary=require('./cloudinaryConfig')
const upload_video = async (req, res) => { try {
  console.log(req.file);
    var videoFile = req.files.video;
    // Assuming the file path is provided in the request body
    console.log(videoFile);
    if (!videoFile) {
      throw new Error("Invalid file");
    }

    // Upload movie file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(
      videoFile.tempFilePath,
      {
        resource_type: "video",
        folder: "movies", // Optional: Specify a folder in your Cloudinary account
      }
    );

    // Return the movie URL and other details
    const movieUrl = uploadResult.secure_url;

    res.status(200).json({ movieUrl });
  } catch (error) {
    console.error("Failed to upload movie:", error);
    res.status(500).json({ error: error.message || "Failed to upload movie" });
  }}
const upload_photo = async (req, res) => { try {
    var photoFile = req.files.photo;
    // Assuming the file path is provided in the request body
    if (!photoFile) {
      throw new Error("Invalid file");
    }

    // Upload movie file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(
        photoFile.tempFilePath,
      {
        resource_type: "auto",
        folder: "photos", // Optional: Specify a folder in your Cloudinary account
      }
    );

    // Return the movie URL and other details
    const posterUrl = uploadResult.secure_url;

    res.status(200).json({ posterUrl });
  } catch (error) {
    console.error("Failed to upload poster:", error);
    res.status(500).json({ error: error.message || "Failed to upload poster" });
  }}

  module.exports = { upload_video,upload_photo };
