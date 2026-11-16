import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { CommerceProvider } from "../provider";
import type {
  Badge,
  Category,
  Product,
  ProductOption,
  ProductPage,
  ProductQuery,
  ProductSummary,
  Variant,
} from "../types";

const productInclude = {
  categories: { include: { category: true }, orderBy: { position: "asc" } },
  images: { orderBy: { position: "asc" } },
  variants: { orderBy: { sku: "asc" } },
} satisfies Prisma.ProductInclude;

type DbProduct = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function mapProduct(p: DbProduct): Product {
  const variants: Variant[] = p.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    title: v.title,
    options: (v.options ?? {}) as Record<string, string>,
    price: v.price ?? p.price,
    stock: v.stock,
  }));
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    highlights: p.highlights,
    currency: p.currency,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    rating: p.ratingAverage != null ? { average: p.ratingAverage, count: p.ratingCount } : null,
    badges: p.badges as Badge[],
    tags: p.tags,
    isNew: p.isNew,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    categories: p.categories.map(({ category: c }) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      shortName: c.shortName ?? c.name,
    })),
    images: p.images.map((i) => ({ src: i.src, alt: i.alt, width: i.width, height: i.height })),
    options: (p.options ?? []) as unknown as ProductOption[],
    variants,
    attributes: (p.attributes ?? {}) as Record<string, string>,
    inStock: variants.some((v) => v.stock > 0),
  };
}

export function toSummary(p: Product): ProductSummary {
  const dv = p.variants.find((v) => v.stock > 0) ?? p.variants[0];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    currency: p.currency,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    rating: p.rating,
    badges: p.badges,
    categories: p.categories,
    images: p.images.slice(0, 1),
    highlights: p.highlights,
    inStock: p.inStock,
    isNew: p.isNew,
    hasOptions: p.options.length > 0,
    defaultVariantId: dv?.id ?? null,
    defaultVariantStock: dv?.stock ?? 0,
  };
}

function buildWhere(q: ProductQuery): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [{ status: "active" }];

  if (q.ids?.length) and.push({ id: { in: q.ids } });
  if (q.slugs?.length) and.push({ slug: { in: q.slugs } });
  if (q.category) and.push({ categories: { some: { category: { slug: q.category } } } });
  if (q.minPrice != null) and.push({ price: { gte: q.minPrice } });
  if (q.maxPrice != null) and.push({ price: { lte: q.maxPrice } });
  if (q.minRating != null) and.push({ ratingAverage: { gte: q.minRating } });
  if (q.onSale) and.push({ compareAtPrice: { not: null } });
  if (q.isNew) and.push({ isNew: true });
  if (q.bestSellers) and.push({ isBestSeller: true });
  if (q.inStock) and.push({ variants: { some: { stock: { gt: 0 } } } });

  const terms = (q.search ?? "")
    .toLowerCase()
    .split(/[^a-z0-9&-]+/)
    .filter((t) => t.length > 1);
  for (const term of terms) {
    const singular = term.endsWith("s") && term.length > 3 ? term.slice(0, -1) : term;
    and.push({
      OR: [
        { name: { contains: singular, mode: "insensitive" } },
        { description: { contains: singular, mode: "insensitive" } },
        { tags: { hasSome: [term, singular] } },
        { categories: { some: { category: { name: { contains: singular, mode: "insensitive" } } } } },
      ],
    });
  }
  return { AND: and };
}

function buildOrder(sort: ProductQuery["sort"]): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    case "rating":
      return [{ ratingAverage: { sort: "desc", nulls: "last" } }, { ratingCount: "desc" }];
    case "newest":
      return [{ isNew: "desc" }, { createdAt: "desc" }];
    default:
      return [{ isFeatured: "desc" }, { sortOrder: "asc" }];
  }
}

export const prismaCommerce: CommerceProvider = {
  async getCategories() {
    const rows = await db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return rows.map(
      (c): Category => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        shortName: c.shortName ?? c.name,
        description: c.description,
        image: c.image,
        productCount: c._count.products,
      }),
    );
  },

  async getCategory(slug) {
    const c = await db.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });
    if (!c) return null;
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      shortName: c.shortName ?? c.name,
      description: c.description,
      image: c.image,
      productCount: c._count.products,
    };
  },

  async getProducts(query = {}) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(48, Math.max(1, query.pageSize ?? 12));
    const where = buildWhere(query);
    // Price range is computed without the price filter so the slider bounds stay stable.
    const rangeWhere = buildWhere({ ...query, minPrice: undefined, maxPrice: undefined });
    const [rows, total, range] = await Promise.all([
      db.product.findMany({
        where,
        include: productInclude,
        orderBy: buildOrder(query.sort),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.product.count({ where }),
      db.product.aggregate({ where: rangeWhere, _min: { price: true }, _max: { price: true } }),
    ]);
    const result: ProductPage = {
      items: rows.map(mapProduct).map(toSummary),
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
      priceRange: { min: range._min.price ?? 0, max: range._max.price ?? 0 },
    };
    return result;
  },

  async getProduct(slug) {
    const p = await db.product.findUnique({ where: { slug }, include: productInclude });
    return p && p.status === "active" ? mapProduct(p) : null;
  },

  async getProductsByIds(ids) {
    if (!ids.length) return [];
    const rows = await db.product.findMany({ where: { id: { in: ids } }, include: productInclude });
    return rows.map(mapProduct);
  },

  async getRelatedProducts(product, limit = 4) {
    const rows = await db.product.findMany({
      where: {
        status: "active",
        id: { not: product.id },
        categories: { some: { categoryId: { in: product.categories.map((c) => c.id) } } },
      },
      include: productInclude,
      orderBy: [{ isBestSeller: "desc" }, { sortOrder: "asc" }],
      take: limit,
    });
    let items = rows.map(mapProduct);
    if (items.length < limit) {
      const extra = await db.product.findMany({
        where: { status: "active", id: { notIn: [product.id, ...items.map((i) => i.id)] } },
        include: productInclude,
        orderBy: [{ isBestSeller: "desc" }, { sortOrder: "asc" }],
        take: limit - items.length,
      });
      items = items.concat(extra.map(mapProduct));
    }
    return items.map(toSummary);
  },
};
