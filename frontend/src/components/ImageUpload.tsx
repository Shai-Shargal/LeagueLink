import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  IconButton,
} from "@mui/material";
import { PhotoCamera, Delete } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface ImageUploadProps {
  currentImage?: string;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  size?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onUpload,
  onDelete,
  size = 150,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("File selected:", file.name, file.type, file.size);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log("Preview generated");
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      setLoading(true);
      console.log("Starting upload...");
      await onUpload(file);
      console.log("Upload completed successfully");
      // Clear preview since we'll get the actual image from props
      setPreview(null);
    } catch (error) {
      console.error("Error uploading image:", error);
      setPreview(null);
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      setLoading(true);
      console.log("Starting delete...");
      await onDelete();
      setPreview(null);
      console.log("Delete completed successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: "2px dashed rgba(198, 128, 227, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "rgba(30, 41, 59, 0.7)",
        }}
      >
        {loading ? (
          <CircularProgress size={24} sx={{ color: "#C680E3" }} />
        ) : preview || currentImage ? (
          <>
            <Box
              component="img"
              src={preview || currentImage}
              alt="Preview"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {onDelete && (
              <IconButton
                size="small"
                onClick={handleDelete}
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                  },
                }}
              >
                <Delete sx={{ color: "#fff", fontSize: 20 }} />
              </IconButton>
            )}
          </>
        ) : (
          <PhotoCamera
            sx={{ color: "rgba(198, 128, 227, 0.4)", fontSize: 40 }}
          />
        )}
      </Box>

      <Button
        component="label"
        variant="outlined"
        startIcon={<PhotoCamera />}
        sx={{
          color: "#C680E3",
          borderColor: "rgba(198, 128, 227, 0.4)",
          "&:hover": {
            borderColor: "#C680E3",
            backgroundColor: "rgba(198, 128, 227, 0.1)",
          },
        }}
      >
        Upload Image
        <VisuallyHiddenInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
        />
      </Button>
    </Box>
  );
};

export default ImageUpload;
