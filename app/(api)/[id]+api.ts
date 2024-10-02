import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  // Check for the required id parameter
  if (!id) {
    return Response.json("Missing required fields", { status: 400 });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Query to get the balance and transaction details
    const result = await sql`
            SELECT 
            u.id AS user_id,
            t.id,
            t.date,
            t.category,
            t.amount,
            t.status,
            SUM(CASE WHEN t.status = 'in' THEN t.amount ELSE -t.amount END) OVER () AS balance
            FROM users u
            JOIN transactions t ON u.id = t.user_id
            WHERE u.clerk_id = ${id}
            ORDER BY t.date DESC;
        `;

    // If no transactions found, return a message
    if (result.length === 0) {
      return Response.json(
        { message: "No transactions found for this user." },
        { status: 404 }
      );
    }

    return Response.json({ data: result }, { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
}
