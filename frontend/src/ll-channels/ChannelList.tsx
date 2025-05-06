import React from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import CrownIcon from "./icons/CrownIcon";
import FootballIcon from "./icons/FootballIcon";

interface Channel {
  _id: string;
  name: string;
  description: string;
  image: string;
  members: Array<{
    _id: string;
    username: string;
    profilePicture: string;
  }>;
  admins: Array<{
    _id: string;
    username: string;
    profilePicture: string;
  }>;
  owner: {
    _id: string;
    username: string;
    profilePicture: string;
  };
}

interface ChannelListProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  currentUserId: string | null;
  onChannelClick: (channel: Channel) => void;
  onSettingsClick: (
    event: React.MouseEvent<HTMLElement>,
    channel: Channel
  ) => void;
}

const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  selectedChannel,
  currentUserId,
  onChannelClick,
  onSettingsClick,
}) => {
  return (
    <List
      sx={{
        flex: 1,
        overflowY: "auto",
        pt: 0,
        height: "calc(100% - 64px)",
        "&::-webkit-scrollbar": {
          width: "4px",
        },
        "&::-webkit-scrollbar-track": {
          background: "rgba(15, 23, 42, 0.3)",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(198, 128, 227, 0.3)",
          borderRadius: "2px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "rgba(198, 128, 227, 0.5)",
        },
      }}
    >
      <ListItem
        sx={{
          px: 2,
          py: 1,
          color: "#dcddde",
          fontSize: "12px",
          fontWeight: "bold",
        }}
      >
        CHANNELS
      </ListItem>
      {channels.map((channel) => (
        <ListItem
          key={channel._id}
          component="div"
          onClick={() => onChannelClick(channel)}
          sx={{
            px: 2,
            py: 0.5,
            color: selectedChannel?._id === channel._id ? "#fff" : "#8e9297",
            cursor: "pointer",
            backgroundColor:
              selectedChannel?._id === channel._id
                ? "rgba(79, 84, 92, 0.6)"
                : "transparent",
            "&:hover": {
              backgroundColor:
                selectedChannel?._id === channel._id
                  ? "rgba(79, 84, 92, 0.6)"
                  : "rgba(79, 84, 92, 0.4)",
              color: "#dcddde",
              "& .channel-settings": {
                opacity: 1,
              },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
            <Tooltip
              title={
                channel.owner?._id === currentUserId
                  ? "You own this channel"
                  : "Channel member"
              }
            >
              {channel.owner?._id === currentUserId ? (
                <CrownIcon
                  sx={{
                    fontSize: "20px",
                    transform: "scale(1.2)",
                    opacity: 1,
                  }}
                />
              ) : (
                <FootballIcon
                  sx={{
                    fontSize: "20px",
                    transform: "scale(1.2)",
                    opacity: 0.7,
                  }}
                />
              )}
            </Tooltip>
          </ListItemIcon>
          <ListItemText
            primary={channel.name}
            sx={{
              "& .MuiListItemText-primary": {
                fontSize: "14px",
              },
            }}
          />
          <IconButton
            size="small"
            className="channel-settings"
            onClick={(e) => onSettingsClick(e, channel)}
            sx={{
              color: "inherit",
              opacity: 0,
              transition: "opacity 0.2s",
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </ListItem>
      ))}
    </List>
  );
};

export default ChannelList;
