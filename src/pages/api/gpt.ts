// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ConversationInstance } from "@/interfaces/interface";
import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAIAPIKEY,
});
const openai = new OpenAIApi(configuration);

function getLatestConvo(convo: ConversationInstance[], n = 3) {
  return convo
    .slice(-n)
    .map((chat) => "User:" + chat.user_message + "\nBot:" + chat.bot_message)
    .join("\n");
}

async function summary(props: ConversationInstance[]) {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `
      Summarize conversation with following context:
      ${getLatestConvo(props)}
      ---
      Summary:
      `,
      max_tokens: 500,
      temperature: 0.3,
    });
    //@ts-ignore
    return response.data.choices[0].text.trim();
  } catch (err) {
    throw new Error("error");
  }
}

async function respond(
  text: string,
  prompt: string,
  lastConvo: ConversationInstance[]
) {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `
      GPT Chatbot
      --- SOP ---
      ${prompt}
      --- Summary ---
      ${await summary(lastConvo)}
      ---
      ${getLatestConvo(lastConvo)}
      User: ${text}
      Bot:
      `,
      max_tokens: 500,
      temperature: 0.1,
    });
    //@ts-ignore
    let botResponse = response.data?.choices[0].text.trim();
    return botResponse;
  } catch (err) {
    throw new Error("error");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const resp = await respond(
      req.body.text,
      req.body.prompt,
      req.body.lastConvo
    );
    res.status(200).json(resp);
  } catch (err) {
    res.status(500).json(err);
  }
}
