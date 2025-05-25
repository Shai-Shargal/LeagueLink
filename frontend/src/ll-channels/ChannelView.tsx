import {
  useEffect,
  useState,
  useMemo,
  useRef,
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  SendIcon,
  TournamentIcon,
  StatsIcon,
  AddIcon,
  authService,
  sendMessage,
  subscribeToChannelMessages,
  uploadChannelImage,
} from "./ChannelViewExport";
import type { Message } from "./ChannelViewExport";
import type {
  Channel,
  ApiResponse,
  ChannelViewProps,
} from "./types/ChannelView";
import { useNavigate } from "react-router-dom";

const ChannelView: React.FC<ChannelViewProps> = ({ channelId }) => {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showTournament, setShowTournament] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        setCurrentUser(response);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

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

  useEffect(() => {
    if (!channelId || !currentUser) return;

    const unsubscribe = subscribeToChannelMessages(
      channelId,
      (updatedMessages) => {
        setMessages(updatedMessages);
      }
    );

    return () => unsubscribe();
  }, [channelId, currentUser]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await authService.getMyChannels();
        if (response.data) {
          setChannels(response.data);
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };

    fetchChannels();
  }, []);

  // Filter out admins from the members list to avoid duplicates
  const regularMembers = useMemo(() => {
    if (!channel) return [];
    const adminIds = new Set(channel.admins?.map((admin) => admin._id));
    return channel.members?.filter((member) => !adminIds.has(member._id)) || [];
  }, [channel?.members, channel?.admins]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !channelId) return;
    try {
      setUploadingImage(true);
      const imageUrl = await uploadChannelImage(channelId, file);
      if (channel) {
        setChannel({ ...channel, image: imageUrl });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Add scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser || !channelId) return;

    const messageText = message;
    setMessage("");

    try {
      await sendMessage({
        text: messageText,
        senderId: currentUser._id,
        senderName: currentUser.username,
        channelId: channelId,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessage(messageText);
    }
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
        position: "relative",
        overflow: "hidden",
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
          maxWidth: "calc(100% - 240px)", // Subtract members sidebar width
          borderRight: "1px solid rgba(198, 128, 227, 0.2)",
          overflow: "hidden",
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
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={channel.image}
              sx={{
                width: 40,
                height: 40,
                fontSize: "20px",
                cursor: "pointer",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {channel.name?.charAt(0)?.toUpperCase() || "#"}
            </Avatar>
            {channel.owner?._id === currentUser?._id && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  backgroundColor: "rgba(15, 23, 42, 0.8)",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.2s",
                  "&:hover": {
                    opacity: 1,
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                  },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <AddIcon sx={{ fontSize: 16, color: "#C680E3" }} />
              </Box>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: "none" }}
            />
          </Box>
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
            overflowY: "auto",
            p: 2,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "rgba(15, 23, 42, 0.3)",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(198, 128, 227, 0.3)",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(198, 128, 227, 0.5)",
            },
          }}
        >
          {messages.map((message, index) => {
            const isCurrentUser =
              currentUser && message.senderId === currentUser._id;
            const showSenderName =
              index === 0 || messages[index - 1].senderId !== message.senderId;

            return (
              <Box
                key={message.id}
                sx={{
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isCurrentUser ? "flex-end" : "flex-start",
                }}
              >
                {showSenderName && !isCurrentUser && (
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      mb: 0.5,
                      ml: 1,
                      fontSize: "0.8rem",
                    }}
                  >
                    {message.senderName}
                  </Typography>
                )}
                <Box
                  sx={{
                    maxWidth: "70%",
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: isCurrentUser
                      ? "rgba(198, 128, 227, 0.2)"
                      : "rgba(30, 41, 59, 0.8)",
                    position: "relative",
                    ...(isCurrentUser
                      ? {
                          borderTopRightRadius: showSenderName ? 8 : 4,
                          borderBottomRightRadius: 4,
                          borderTopLeftRadius: 8,
                          borderBottomLeftRadius: 8,
                          mr: 1,
                        }
                      : {
                          borderTopLeftRadius: showSenderName ? 8 : 4,
                          borderBottomLeftRadius: 4,
                          borderTopRightRadius: 8,
                          borderBottomRightRadius: 8,
                          ml: 1,
                        }),
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#fff",
                      wordBreak: "break-word",
                      fontSize: "0.95rem",
                      lineHeight: 1.5,
                      fontWeight: 400,
                    }}
                  >
                    {message.text}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      display: "block",
                      mt: 0.5,
                      textAlign: "right",
                      fontSize: "0.75rem",
                      lineHeight: 1,
                    }}
                  >
                    {new Date(message.timestamp).toLocaleTimeString("he-IL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid rgba(198, 128, 227, 0.2)",
            backgroundColor: "rgba(15, 23, 42, 0.98)",
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
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#C680E3",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(198, 128, 227, 0.2)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(198, 128, 227, 0.4)",
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleSendMessage}
                    sx={{
                      color: "#C680E3",
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
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          borderLeft: "1px solid rgba(198, 128, 227, 0.2)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
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
        {/* Admins Section */}
        <Box sx={{ p: 2, pb: 0 }}>
          <Typography
            variant="subtitle2"
            component="div"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.75rem",
              fontWeight: 600,
              mb: 1,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Admins — {channel?.admins?.length || 0}
          </Typography>
          <List disablePadding>
            {channel?.admins?.map((admin) => (
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
        <Box sx={{ p: 2, pt: 1, flex: 1, overflowY: "auto" }}>
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

        {/* Tournament and Stats Button */}
        <Box sx={{ p: 2, borderTop: "1px solid rgba(198, 128, 227, 0.2)" }}>
          <Button
            variant="contained"
            startIcon={<TournamentIcon />}
            endIcon={<StatsIcon />}
            onClick={() =>
              navigate(`/dashboard?channel=${channelId}&view=tournaments`)
            }
            sx={{
              width: "100%",
              backgroundColor: "rgba(198, 128, 227, 0.2)",
              color: "#fff",
              "&:hover": {
                backgroundColor: "rgba(198, 128, 227, 0.3)",
              },
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Tournament Stats
          </Button>
        </Box>
      </Box>

      {/* Tournament Stats View */}
      {showTournament && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.98)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
          }}
        ></Box>
      )}
    </Box>
  );
};

export default ChannelView;
