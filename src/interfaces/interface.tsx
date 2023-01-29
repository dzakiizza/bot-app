export interface BotInstance {
  id: string;
  summary: string;
  name: string;
  prompt: string;
}

export interface ConversationInstance {
  user_message: string;
  bot_message: string;
  bot_id: string;
  id: string;
}
