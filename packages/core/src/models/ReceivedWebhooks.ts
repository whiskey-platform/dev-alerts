export interface ReceivedWebhook {
  type: 'github' | 'seed';
  timestamp: number;
  payload: any;
}
