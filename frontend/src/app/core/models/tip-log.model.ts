export type TipStatus = 'SENT' | 'FAILED' | 'PREVIEW';

export interface TipLog {
  id: number;
  scheduleId: number;
  scheduleName: string;
  topicId: number;
  topicName: string;
  channelId: number;
  channelName: string;
  generatedTip: string;
  status: TipStatus;
  errorMessage: string | null;
  triggeredBy: string;
  promptUsed: string | null;
  modelUsed: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  createdAt: string;
}
