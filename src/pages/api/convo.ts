// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { QoreSchema as ProjectSchema, QoreClient } from "@qorebase/client";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "GET") {
    try {
      const client = new QoreClient<ProjectSchema>({
        endpoint: `${process.env.NEXT_PUBLIC_QORE_DATA_CONSOLE_ENDPOINT}`,
        adminSecret: `${process.env.ADMINSECRET}`,
      });
      const convo = await client
        .table("conversations")
        .readRows({
          condition: {
            $and: [
              {
                bot_id: {
                  $eq: req.query.bot_id ? req.query.bot_id : "",
                },
              },
            ],
          },
          orderBy: {
            //@ts-ignore
            created_at: req.query.orderBy ? req.query.orderBy : "ASC",
          },
          limit: req.query.limit ? Number(req.query.limit) : undefined,
        })
        .toPromise();

      res.status(200).json(convo);
    } catch (err) {
      res.status(500).json({ error: "Error" });
    }
  } else if (req.method === "POST") {
    try {
      const reqs = await axios.post(
        `${process.env.NEXT_PUBLIC_QORE_DATA_CONSOLE_ENDPOINT}/v1/table/conversations`,
        {
          data: req.body,
        },
        {
          headers: {
            "x-qore-engine-admin-secret": process.env.ADMINSECRET,
          },
        }
      );
      res.status(200).json(reqs.data);
    } catch (err) {
      res.status(500).json({ error: "Error" });
    }
  } else if (req.method === "PATCH") {
    try {
      const reqs = await axios.patch(
        `${process.env.NEXT_PUBLIC_QORE_DATA_CONSOLE_ENDPOINT}/v1/table/conversations/row/${req.query.convo_id}`,
        {
          bot_message: req.body.bot_message,
        },
        {
          headers: {
            "x-qore-engine-admin-secret": process.env.ADMINSECRET,
          },
        }
      );
      res.status(200).json(reqs.data);
    } catch (err) {
      res.status(500).json({ error: "Error" });
    }
  }
}
