import { Topic } from './topic.model';
import { TeamsChannel } from './teams-channel.model';

export interface Schedule {
  id: number;
  name: string;
  topic: Topic;
  channel: TeamsChannel;
  sendTimes: string[];
  cronExpression: string;
  timezone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleRequest {
  name: string;
  topicId: number;
  channelId: number;
  sendTimes: string[];
  timezone: string;
  active: boolean;
}
