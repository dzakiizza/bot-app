// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "POST") {
    try {
      const reqs = await axios.post(
        `${process.env.NEXT_PUBLIC_QORE_DATA_CONSOLE_ENDPOINT}/v1/table/bots`,
        {
          data: req.body,
        },
        {
          headers: {
            "x-qore-engine-admin-secret": process.env.ADMINSECRET,
          },
        }
      );
      res.status(200).json({ status: reqs.status, id: reqs.data.id });
    } catch (err) {
      res.status(500).json(err);
    }
  } else if (req.method === "GET") {
    try {
      const { bot_id } = req.query;
      if (bot_id) {
        const reqs = await axios.get(
          `${process.env.NEXT_PUBLIC_QORE_DATA_CONSOLE_ENDPOINT}/v1/table/bots/row/${bot_id}`,
          {
            headers: {
              "x-qore-engine-admin-secret": process.env.ADMINSECRET,
            },
          }
        );
        res.status(200).json(reqs.data);
      } else {
        const reqs = await axios.get(
          `${process.env.NEXT_PUBLIC_QORE_DATA_CONSOLE_ENDPOINT}/v1/table/bots`,
          {
            headers: {
              "x-qore-engine-admin-secret": process.env.ADMINSECRET,
            },
          }
        );
        res.status(200).json(reqs.data.items);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else if (req.method === "DELETE") {
    try {
      const reqs = await axios.delete(
        `${process.env.NEXT_PUBLIC_QORE_DATA_CONSOLE_ENDPOINT}/v1/table/bots/row/${req.query.bot_id}`,
        {
          headers: {
            "x-qore-engine-admin-secret": process.env.ADMINSECRET,
          },
        }
      );
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json(err);
    }
  } else if (req.method === "PATCH") {
    try {
      const reqs = await axios.patch(
        `${process.env.NEXT_PUBLIC_QORE_DATA_CONSOLE_ENDPOINT}/v1/table/bots/row/${req.query.bot_id}`,
        {
          name: req.body.name,
          prompt: req.body.prompt
        },
        {
          headers: {
            "x-qore-engine-admin-secret": process.env.ADMINSECRET,
          },
        }
      );
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json(err);
    }
  }
}
