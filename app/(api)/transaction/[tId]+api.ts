import { neon } from "@neondatabase/serverless";
import { useUser } from "@clerk/clerk-expo";

export async function PUT(request: Request, { tId }: { tId: string }) {
  // Check if the transaction ID is provided
  if (!tId) {
    return Response.json("Missing required fields", { status: 400 });
  } 

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    const body = await request.json();
    const { user_id, date, category, amount, status } = body;

    // Check for required fields in the request body
    if (!user_id || !date || !category || amount === undefined || !status) {
      return Response.json("Missing required fields in the request body", {
        status: 400,
      });
    }

    // Update the transaction in the database
    const result = await sql`
      UPDATE transactions
      SET date = ${date}, category = ${category}, amount = ${amount}, status = ${status}
      WHERE id = ${tId} AND user_id = (SELECT id FROM users WHERE clerk_id = ${user_id})
      RETURNING *;  -- This returns the updated transaction
    `;

    // Check if the transaction was updated
    if (result.length === 0) {
      return Response.json(
        { message: "Transaction not found or no changes made." },
        { status: 404 }
      );
    }

    // Return the updated transaction
    return Response.json({ data: result[0] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
}

export async function GET(request: Request, { tId }: { tId: string }) {
  

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

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
            AND t.id = ${tId}
            ORDER BY t.date DESC;
        `;

    return Response.json({ data: result[0] }, { status: 200 });
  } catch (error) {
    console.error(error);
  }
}

export async function DELETE(request: Request, { tId }: { tId: string }) {



  if (!tId) {
    return Response.json("Missing required fields", { status: 400 });
  } 

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const id = request.headers.get("user_id");

    // Delete the transaction from the database
    const result = await sql`
      DELETE FROM transactions
      WHERE id = ${tId} AND user_id = (SELECT id FROM users WHERE clerk_id = ${id})
      RETURNING *;  -- This returns the deleted transaction
    `;

    // Check if the transaction was deleted
    if (result.length === 0) {
      return Response.json(
        { message: "Transaction not found." },
        { status: 404 }
      );
    }

    // Return a success message
    return Response.json({ message: "Transaction deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
}