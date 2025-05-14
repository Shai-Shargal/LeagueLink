import React, { useState } from "react";
import {
  Box,
  TextField,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
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

const ChannelSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await channelService.searchChannels(query);
      setChannels(response.data);
    } catch (err) {
      setError("Failed to search channels");
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

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Search Channels
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Search channels"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading}
            >
              Search
            </Button>
          </Box>
        </CardContent>
      </Card>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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

      {channels.length > 0 ? (
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
      ) : (
        !loading &&
        query && (
          <Typography color="text.secondary" align="center">
            No channels found
          </Typography>
        )
      )}
    </Box>
  );
};

export default ChannelSearch;
