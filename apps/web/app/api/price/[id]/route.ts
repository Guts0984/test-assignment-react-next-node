import { ApiError, getProductPrice } from "@/features/products/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "Invalid product id" }, { status: 400 });
  }

  try {
    const price = await getProductPrice(id);
    return Response.json(price);
  } catch (err) {
    if (err instanceof ApiError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
