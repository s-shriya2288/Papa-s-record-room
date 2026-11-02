// Lists the books on Papa's shelf: each book has a small JSON file under books/meta/.
import { list } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const { blobs } = await list({ prefix: "books/meta/", limit: 1000 });
    const rows = await Promise.all(blobs.map(b => fetch(b.url).then(r => (r.ok ? r.json() : null)).catch(() => null)));
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(rows.filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: String((err && err.message) || err) });
  }
}
