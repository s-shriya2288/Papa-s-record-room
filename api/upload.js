// Grants the page a one-time token to upload a book straight to Vercel Blob (files can be bigger than a
// function request allows). If FAMILY_CODE is set in the project's environment, uploads need that code.
import { handleUpload } from "@vercel/blob/client";

const TYPES = ["application/pdf", "text/plain", "application/json", "image/jpeg", "image/png", "image/webp", "image/gif"];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const code = process.env.FAMILY_CODE;
        let sent = "";
        try { sent = JSON.parse(clientPayload || "{}").code || ""; } catch (e) {}
        if (code && sent !== code) throw new Error("Wrong family code");
        if (!/^books\/(files|meta)\/[\w.-]+$/.test(pathname)) throw new Error("Not a book path");
        return { allowedContentTypes: TYPES, maximumSizeInBytes: 50 * 1024 * 1024, addRandomSuffix: true };
      },
      onUploadCompleted: async () => {},
    });
    res.status(200).json(json);
  } catch (err) {
    res.status(400).json({ error: String((err && err.message) || err) });
  }
}
