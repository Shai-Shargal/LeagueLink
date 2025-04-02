import React, { useMemo } from "react";
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
} from "@mui/material";

interface Member {
  _id: string;
  username: string;
  profilePicture: string;
}

interface ChannelViewProps {
  channel: {
    _id: string;
    name: string;
    description: string;
    image: string;
    members: Member[];
    admins: Member[];
  };
}

const ChannelView: React.FC<ChannelViewProps> = ({ channel }) => {
  // Filter out admins from the members list to avoid duplicates
  const regularMembers = useMemo(() => {
    const adminIds = new Set(channel.admins?.map((admin) => admin._id));
    return channel.members?.filter((member) => !adminIds.has(member._id)) || [];
  }, [channel.members, channel.admins]);

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
      }}
    >
      {/* Main Chat Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Channel Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid rgba(198, 128, 227, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: 2,
            backgroundColor: "rgba(15, 23, 42, 0.98)",
          }}
        >
          <Avatar src={channel.image} sx={{ width: 32, height: 32 }}>
            {channel.name?.charAt(0)?.toUpperCase() || "#"}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ color: "#fff", fontSize: "1rem" }}>
              {channel.name || "Unnamed Channel"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              {channel.description || "No description"}
            </Typography>
          </Box>
        </Box>

        {/* Chat Messages Area (placeholder for now) */}
        <Box sx={{ flex: 1, p: 2, overflowY: "auto" }}>
          <Typography sx={{ color: "#fff", textAlign: "center", mt: 4 }}>
            Chat messages will appear here
          </Typography>
        </Box>

        {/* Message Input (placeholder for now) */}
        <Paper
          sx={{
            m: 2,
            p: 2,
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(198, 128, 227, 0.2)",
          }}
        >
          <Typography sx={{ color: "#fff", textAlign: "center" }}>
            Message input will be here
          </Typography>
        </Paper>
      </Box>

      {/* Members Sidebar */}
      <Box
        sx={{
          width: 240,
          borderLeft: "1px solid rgba(198, 128, 227, 0.2)",
          backgroundColor: "rgba(15, 23, 42, 0.98)",
          overflowY: "auto",
        }}
      >
        {/* Admins Section */}
        <Box sx={{ p: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              mb: 1,
              fontSize: "0.8rem",
            }}
          >
            ADMINS — {channel.admins?.length || 0}
          </Typography>
          <List disablePadding>
            {channel.admins?.map((admin) => (
              <ListItem key={`admin-${admin._id}`} sx={{ px: 0, py: 0.5 }}>
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar
                    src={admin.profilePicture}
                    sx={{ width: 32, height: 32 }}
                  >
                    {admin.username?.charAt(0)?.toUpperCase() || "#"}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={admin.username}
                  sx={{
                    "& .MuiListItemText-primary": {
                      color: "#fff",
                      fontSize: "0.9rem",
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ borderColor: "rgba(198, 128, 227, 0.2)" }} />

        {/* Members Section */}
        <Box sx={{ p: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              mb: 1,
              fontSize: "0.8rem",
            }}
          >
            MEMBERS — {regularMembers.length}
          </Typography>
          <List disablePadding>
            {regularMembers.map((member) => (
              <ListItem key={`member-${member._id}`} sx={{ px: 0, py: 0.5 }}>
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar
                    src={member.profilePicture}
                    sx={{ width: 32, height: 32 }}
                  >
                    {member.username?.charAt(0)?.toUpperCase() || "#"}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={member.username}
                  sx={{
                    "& .MuiListItemText-primary": {
                      color: "#fff",
                      fontSize: "0.9rem",
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
