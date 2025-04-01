import { storage } from "../config/firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export const firebaseStorage = {
  uploadImage: async (
    file: File,
    folder: "users" | "channels"
  ): Promise<string> => {
    try {
      console.log("Starting Firebase cloud upload for folder:", folder);

      // Generate unique filename
      const fileExtension = file.name.split(".").pop();
      const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
      console.log("Generated filename:", fileName);

      // Create storage reference
      const storageRef = ref(storage, fileName);
      console.log("Storage reference created");

      // Set metadata with CORS headers
      const metadata = {
        contentType: file.type,
        customMetadata: {
          "uploaded-by": "leaguelink-app",
          "original-name": file.name,
        },
      };

      // Upload file with progress tracking
      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload progress:", progress + "%");
          },
          (error) => {
            console.error("Upload error:", error);
            reject(new Error(`Upload failed: ${error.message}`));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log("Upload completed successfully. URL:", downloadURL);
              resolve(downloadURL);
            } catch (error) {
              console.error("Error getting download URL:", error);
              reject(new Error("Failed to get download URL"));
            }
          }
        );
      });
    } catch (error: any) {
      console.error("Error in upload process:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  },

  deleteImage: async (imageUrl: string): Promise<void> => {
    try {
      if (!imageUrl) {
        console.log("No image URL provided for deletion");
        return;
      }

      // Extract the path from the URL
      const decodedUrl = decodeURIComponent(imageUrl);
      const pathMatch = decodedUrl.match(/o\/(.+?)\?/);
      if (!pathMatch) {
        throw new Error("Invalid image URL format");
      }
      const path = pathMatch[1];
      console.log("Deleting image at path:", path);

      const imageRef = ref(storage, path);
      await deleteObject(imageRef);
      console.log("Image deleted successfully");
    } catch (error: any) {
      console.error("Error deleting image from Firebase:", error);
      if (error.code === "storage/object-not-found") {
        console.log("Image already deleted or doesn't exist");
      } else {
        throw new Error(`Failed to delete image: ${error.message}`);
      }
    }
  },
};
