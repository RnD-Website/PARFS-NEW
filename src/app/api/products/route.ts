import { commerce, toSummary } from "@/lib/commerce";

/**
 * GET /api/products?ids=a,b,c   — product summaries by id (wishlist, recently viewed).
 * GET /api/products?slugs=a,b,c — product summaries by slug (PARFS wishlist; unknown slugs are skipped).
 */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const slugs = (params.get("slugs") ?? "").split(",").filter(Boolean).slice(0, 48);
  if (slugs.length) {
    const page = await commerce.getProducts({ slugs, pageSize: slugs.length });
    return Response.json({ items: page.items });
  }
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean).slice(0, 48);
  if (!ids.length) return Response.json({ items: [] });
  const products = await commerce.getProductsByIds(ids);
  const order = new Map(ids.map((id, i) => [id, i]));
  const items = products.map(toSummary).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return Response.json({ items });
}
