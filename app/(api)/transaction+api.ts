import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { user_id, transaction_id, date, category, amount, status} =
      await request.json();
    if (
      !user_id ||
      !transaction_id ||
      !date ||
      !category ||
      !amount ||
      !status
    ) {
      return Response.json("Missing required fields", { status: 400 });
    }

    const response = await sql`
      INSERT INTO transactions (user_id, transaction_id, date, category, amount, status)
      SELECT u.id, ${transaction_id}, ${date}, ${category}, ${amount}, ${status}
      FROM users u
      WHERE u.clerk_id = ${user_id}
      RETURNING *
    `;

    return new Response(JSON.stringify({ data: response }), {
      status: 201,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ error: error }, { status: 500 });
  }
}
