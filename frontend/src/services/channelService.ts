import axios from "axios";
import { API_URL } from "../config";

const channelService = {
  // Get user's channels
  getMyChannels: async () => {
    const response = await axios.get(`${API_URL}/channels/my-channels`);
    return response.data;
  },

  // Find channel by name
  findChannelByName: async (name: string) => {
    const response = await axios.get(
      `${API_URL}/channels/find/${encodeURIComponent(name)}`
    );
    return response.data;
  },

  // List all public channels
  listPublicChannels: async () => {
    const response = await axios.get(`${API_URL}/channels`);
    return response.data;
  },

  // Get channel statistics
  getChannelStats: async (channelId: string) => {
    const response = await axios.get(`${API_URL}/channels/${channelId}/stats`);
    return response.data;
  },

  // Search channels
  searchChannels: async (query: string) => {
    const response = await axios.get(
      `${API_URL}/channels/search?query=${encodeURIComponent(query)}`
    );
    return response.data;
  },

  // Transfer channel ownership
  transferOwnership: async (channelId: string, newOwnerId: string) => {
    const response = await axios.post(
      `${API_URL}/channels/${channelId}/transfer/${newOwnerId}`
    );
    return response.data;
  },

  // Get channel details
  getChannelDetails: async (channelId: string) => {
    const response = await axios.get(`${API_URL}/channels/${channelId}`);
    return response.data;
  },

  // Update channel settings
  updateChannelSettings: async (
    channelId: string,
    settings: {
      name?: string;
      description?: string;
      image?: string;
      isPrivate?: boolean;
    }
  ) => {
    const response = await axios.patch(
      `${API_URL}/channels/${channelId}/settings`,
      settings
    );
    return response.data;
  },

  // Create channel
  createChannel: async (channelData: {
    name: string;
    description: string;
    passcode: string;
    image?: string;
  }) => {
    const response = await axios.post(`${API_URL}/channels`, channelData);
    return response.data;
  },

  // Join channel
  joinChannel: async (channelName: string, passcode: string) => {
    const response = await axios.post(`${API_URL}/channels/join`, {
      channelName,
      passcode,
    });
    return response.data;
  },

  // Leave channel
  leaveChannel: async (channelId: string) => {
    const response = await axios.post(`${API_URL}/channels/${channelId}/leave`);
    return response.data;
  },

  // Delete channel
  deleteChannel: async (channelId: string) => {
    const response = await axios.delete(`${API_URL}/channels/${channelId}`);
    return response.data;
  },

  // Promote member to admin
  promoteMember: async (channelId: string, userId: string) => {
    const response = await axios.post(
      `${API_URL}/channels/${channelId}/promote/${userId}`
    );
    return response.data;
  },

  // Demote admin to member
  demoteAdmin: async (channelId: string, userId: string) => {
    const response = await axios.post(
      `${API_URL}/channels/${channelId}/demote/${userId}`
    );
    return response.data;
  },

  // Kick member
  kickMember: async (channelId: string, userId: string) => {
    const response = await axios.post(
      `${API_URL}/channels/${channelId}/kick/${userId}`
    );
    return response.data;
  },

  // Update channel passcode
  updatePasscode: async (channelId: string, passcode: string) => {
    const response = await axios.patch(
      `${API_URL}/channels/${channelId}/passcode`,
      { passcode }
    );
    return response.data;
  },

  // Get channel members
  getChannelMembers: async (channelId: string) => {
    const response = await axios.get(`${API_URL}/channels/${channelId}`);
    return response.data.data.members;
  },

  // Get all users in a channel
  getChannelUsers: async (channelId: string): Promise<ChannelUser[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/${channelId}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },
};

export default channelService;
