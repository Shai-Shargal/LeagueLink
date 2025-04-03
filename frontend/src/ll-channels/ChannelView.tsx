import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { authService } from "../services/api";

interface Member {
  _id: string;
  username: string;
  profilePicture: string;
}

interface Channel {
  _id: string;
  name: string;
  description: string;
  image: string;
  members: Member[];
  admins: Member[];
}

interface ApiResponse {
  success: boolean;
  data: Channel;
}

interface ChannelViewProps {
  channelId: string;
}

const ChannelView: React.FC<ChannelViewProps> = ({ channelId }) => {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        setLoading(true);
        const response = (await authService.getChannel(
          channelId
        )) as ApiResponse;
        if (response.data) {
          setChannel(response.data);
        }
      } catch (error) {
        console.error("Error fetching channel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [channelId]);

  // Filter out admins from the members list to avoid duplicates
  const regularMembers = useMemo(() => {
    if (!channel) return [];
    const adminIds = new Set(channel.admins?.map((admin) => admin._id));
    return channel.members?.filter((member) => !adminIds.has(member._id)) || [];
  }, [channel?.members, channel?.admins]);

  if (loading || !channel) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(15, 23, 42, 0.95)",
        }}
      >
        <Typography sx={{ color: "#fff" }}>Loading channel...</Typography>
      </Box>
    );
  }

  const handleSendMessage = () => {
    // TODO: Implement send message functionality
    console.log("Sending message:", message);
    setMessage("");
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        width: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      {/* Main Chat Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          maxWidth: "calc(100% - 240px)", // Subtract members sidebar width
          borderRight: "1px solid rgba(198, 128, 227, 0.2)",
        }}
      >
        {/* Channel Header */}
        <Box
          sx={{
            py: 1.5,
            px: 2,
            borderBottom: "1px solid rgba(198, 128, 227, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: 2,
            backgroundColor: "rgba(15, 23, 42, 0.98)",
            minHeight: "48px",
            backdropFilter: "blur(10px)",
          }}
        >
          <Avatar
            src={channel.image}
            sx={{
              width: 24,
              height: 24,
              fontSize: "14px",
            }}
          >
            {channel.name?.charAt(0)?.toUpperCase() || "#"}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#fff",
                fontSize: "0.9rem",
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {channel.name || "Unnamed Channel"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.75rem",
                lineHeight: 1.2,
              }}
            >
              {channel.description || "No description"}
            </Typography>
          </Box>
        </Box>

        {/* Chat Messages Area */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            overflow: "auto",
            p: 2,
            "&::-webkit-scrollbar": {
              width: "8px",
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(198, 128, 227, 0.2)",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(198, 128, 227, 0.4)",
            },
          }}
        >
          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.9rem",
            }}
          >
            Chat messages will appear here
          </Typography>
        </Box>

        {/* Message Input */}
        <Box
          sx={{
            p: 2,
            backgroundColor: "rgba(15, 23, 42, 0.98)",
            borderTop: "1px solid rgba(198, 128, 227, 0.2)",
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                backgroundColor: "rgba(15, 23, 42, 0.7)",
                borderRadius: 2,
                "& fieldset": {
                  borderColor: "rgba(198, 128, 227, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(198, 128, 227, 0.4)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "rgba(198, 128, 227, 0.6)",
                },
              },
              "& .MuiOutlinedInput-input": {
                padding: "12px 14px",
                fontSize: "0.9rem",
                "&::placeholder": {
                  color: "rgba(255, 255, 255, 0.5)",
                  opacity: 1,
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    sx={{
                      color: message.trim()
                        ? "#C680E3"
                        : "rgba(255, 255, 255, 0.3)",
                      "&:hover": {
                        backgroundColor: "rgba(198, 128, 227, 0.1)",
                      },
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* Members Sidebar */}
      <Box
        sx={{
          width: 240,
          height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.98)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          "&::-webkit-scrollbar": {
            width: "4px",
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(198, 128, 227, 0.2)",
            borderRadius: "2px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(198, 128, 227, 0.4)",
          },
        }}
      >
        {/* Admins Section */}
        <Box sx={{ p: 2, pb: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.75rem",
              fontWeight: 600,
              mb: 1,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Admins — {channel.admins?.length || 0}
          </Typography>
          <List disablePadding>
            {channel.admins?.map((admin) => (
              <ListItem key={`admin-${admin._id}`} sx={{ px: 0, py: 0.5 }}>
                <ListItemAvatar sx={{ minWidth: 32 }}>
                  <Avatar
                    src={admin.profilePicture}
                    sx={{ width: 24, height: 24, fontSize: "0.875rem" }}
                  >
                    {admin.username?.charAt(0)?.toUpperCase() || "#"}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={admin.username}
                  sx={{
                    m: 0,
                    "& .MuiListItemText-primary": {
                      color: "#fff",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ borderColor: "rgba(198, 128, 227, 0.2)", my: 1 }} />

        {/* Members Section */}
        <Box sx={{ p: 2, pt: 1, flex: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.75rem",
              fontWeight: 600,
              mb: 1,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Members — {regularMembers.length}
          </Typography>
          <List disablePadding>
            {regularMembers.map((member) => (
              <ListItem key={`member-${member._id}`} sx={{ px: 0, py: 0.5 }}>
                <ListItemAvatar sx={{ minWidth: 32 }}>
                  <Avatar
                    src={member.profilePicture}
                    sx={{ width: 24, height: 24, fontSize: "0.875rem" }}
                  >
                    {member.username?.charAt(0)?.toUpperCase() || "#"}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={member.username}
                  sx={{
                    m: 0,
                    "& .MuiListItemText-primary": {
                      color: "#fff",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
};

export default ChannelView;
