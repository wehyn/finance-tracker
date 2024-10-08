import { neon } from "@neondatabase/serverless";
import { useUser } from "@clerk/clerk-expo";

export async function PUT(request: Request, { tId }: { tId: number }) {
  const { user } = useUser(); // Get the user context from Clerk
  const clerkId = user?.id; // Extract the Clerk ID

  // Check if the user is authenticated
  if (!clerkId) {
    return Response.json("User is not authenticated.", { status: 401 });
  }

  // Check if the transaction ID is provided
  if (!tId) {
    return Response.json("Missing required fields", { status: 400 });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Parse the request body to get updated transaction details
    const body = await request.json();
    const { date, category, amount, status } = body;

    // Check for required fields in the request body
    if (!date || !category || amount === undefined || !status) {
      return Response.json("Missing required fields in the request body", { status: 400 });
    }

    // Update the transaction in the database
    const result = await sql`
      UPDATE transactions
      SET date = ${date}, category = ${category}, amount = ${amount}, status = ${status}
      WHERE id = ${tId} AND user_id = (SELECT id FROM users WHERE clerk_id = ${clerkId})
      RETURNING *;  -- This returns the updated transaction
    `;

    // Check if the transaction was updated
    if (result.length === 0) {
      return Response.json({ message: "Transaction not found or no changes made." }, { status: 404 });
    }

    // Return the updated transaction
    return Response.json({ data: result[0] }, { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
