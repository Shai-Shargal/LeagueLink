import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import channelService from "../services/channelService";

interface Channel {
  _id: string;
  name: string;
  description: string;
  owner: {
    username: string;
    profilePicture?: string;
  };
  members: Array<{
    _id: string;
    username: string;
    profilePicture?: string;
  }>;
}

const PublicChannels: React.FC = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await channelService.listPublicChannels();
      setChannels(response.data);
    } catch (err) {
      setError("Failed to load channels");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (channelName: string) => {
    try {
      setJoinError(null);
      setJoinSuccess(null);

      // Prompt for passcode
      const passcode = prompt("Enter channel passcode:");
      if (!passcode) return;

      await channelService.joinChannel(channelName, passcode);
      setJoinSuccess(`Successfully joined ${channelName}`);

      // Remove the joined channel from the list
      setChannels(channels.filter((channel) => channel.name !== channelName));
    } catch (err: any) {
      setJoinError(err.response?.data?.message || "Failed to join channel");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Public Channels
          </Typography>
          {channels.length === 0 ? (
            <Typography color="text.secondary" align="center">
              No public channels available
            </Typography>
          ) : (
            <List>
              {channels.map((channel) => (
                <Card key={channel._id} sx={{ mb: 2 }}>
                  <ListItem>
                    <ListItemText
                      primary={channel.name}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {channel.description}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            Owner: {channel.owner.username} | Members:{" "}
                            {channel.members.length}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        onClick={() => handleJoin(channel.name)}
                      >
                        Join
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Card>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {joinError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {joinError}
        </Alert>
      )}

      {joinSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {joinSuccess}
        </Alert>
      )}
    </Box>
  );
};

export default PublicChannels;
