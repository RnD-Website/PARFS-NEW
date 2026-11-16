import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { categories, products, seedPrice } from "../src/data/catalog";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

/** Reads width/height from a PNG/JPEG header so <Image> always gets true proportions. */
function imageSize(src: string): { width: number; height: number } {
  const file = path.join(process.cwd(), "public", src);
  if (!existsSync(file)) {
    console.warn(`  ! missing image ${src} — using 1:1 placeholder dimensions`);
    return { width: 800, height: 800 };
  }
  const buf = readFileSync(file);
  if (buf.toString("ascii", 1, 4) === "PNG") {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG: scan for SOF marker
  let i = 2;
  while (i < buf.length) {
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return { width: 800, height: 800 };
}

async function main() {
  console.log("Seeding categories…");
  for (const c of categories) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, shortName: c.shortName, image: c.image, sortOrder: c.sortOrder },
      create: c,
    });
  }
  const cats = Object.fromEntries((await db.category.findMany()).map((c) => [c.slug, c.id]));

  console.log("Seeding products…");
  for (const p of products) {
    const { price, compareAtPrice } = seedPrice(p);
    const data = {
      name: p.name,
      price,
      compareAtPrice,
      currency: "BDT",
      ratingAverage: p.rating?.average ?? null,
      ratingCount: p.rating?.count ?? 0,
      badges: p.badges ?? [],
      tags: p.tags,
      highlights: p.highlights ?? [],
      isNew: p.isNew ?? false,
      isFeatured: p.isFeatured ?? false,
      isBestSeller: p.isBestSeller ?? false,
      sortOrder: p.sortOrder,
      options: p.options ?? [],
      attributes: p.attributes ?? {},
    };
    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });

    await db.productCategory.deleteMany({ where: { productId: product.id } });
    await db.productCategory.createMany({
      data: p.categories.map((slug, position) => ({ productId: product.id, categoryId: cats[slug], position })),
    });

    await db.productImage.deleteMany({ where: { productId: product.id } });
    await db.productImage.createMany({
      data: p.images.map((img, position) => ({ productId: product.id, ...img, ...imageSize(img.src), position })),
    });

    // Variants = cartesian product of options (or a single default variant).
    const opts = p.options ?? [];
    let combos: Record<string, string>[] = [{}];
    for (const o of opts) {
      combos = combos.flatMap((c) => o.values.map((v) => ({ ...c, [o.name]: v.value })));
    }
    const existing = await db.variant.findMany({ where: { productId: product.id } });
    const wanted = new Set<string>();
    for (const combo of combos) {
      const suffix = Object.values(combo).join("-");
      const sku = `${p.slug}${suffix ? `-${suffix}` : ""}`.toUpperCase();
      wanted.add(sku);
      const title =
        opts
          .map((o) => o.values.find((v) => v.value === combo[o.name])?.label)
          .filter(Boolean)
          .join(" / ") || "Default";
      await db.variant.upsert({
        where: { sku },
        update: { title, options: combo },
        create: { productId: product.id, sku, title, options: combo, stock: p.stock ?? 0 },
      });
    }
    const stale = existing.filter((v) => !wanted.has(v.sku)).map((v) => v.id);
    if (stale.length) await db.variant.deleteMany({ where: { id: { in: stale } } });
  }
  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
