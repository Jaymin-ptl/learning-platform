export interface TeamsChannel {
  id: number;
  name: string;
  webhookUrl: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamsChannelRequest {
  name: string;
  webhookUrl: string;
  description: string | null;
  active: boolean;
}
