import { storage } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { authService } from "./api";

export const uploadChannelImage = async (
  channelId: string,
  file: File
): Promise<string> => {
  try {
    // Create a reference to the channel images folder
    const storageRef = ref(
      storage,
      `channels/${channelId}/profile/${file.name}`
    );

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Update the channel with the new image URL
    await authService.updateChannel(channelId, { image: downloadURL });

    return downloadURL;
  } catch (error) {
    console.error("Error uploading channel image:", error);
    throw error;
  }
};
