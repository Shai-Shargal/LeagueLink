export interface Member {
  _id: string;
  username: string;
  profilePicture: string;
}

export interface Channel {
  _id: string;
  name: string;
  description: string;
  image: string;
  members: Member[];
  admins: Member[];
  owner: Member;
}

export interface ApiResponse {
  success: boolean;
  data: Channel;
}

export interface ChannelViewProps {
  channelId: string;
}
