import { neon } from "@neondatabase/serverless";

// Function to capitalize the first letter of each word
function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

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
            u.name,
            u.email,
            u.clerk_id,
            t.transaction_id,
            t.date,
            t.category,
            t.amount,
            t.status,
            SUM(CASE WHEN t.status = 'in' THEN t.amount ELSE -t.amount END) OVER () AS balance
            FROM users u
            JOIN transactions t ON u.id = t.user_id
            WHERE u.clerk_id = ${id};
        `;

    // If no transactions found, return a message
    if (result.length === 0) {
      return Response.json(
        { message: "No transactions found for this user." },
        { status: 404 }
      );
    }

    // Format the result data
    const formattedData = result.map(item => ({
      ...item,
      category: capitalizeWords(item.category), // Capitalize each word in the category
      date: new Date(item.date).toISOString().split('T')[0] // Ensure date is a string in "YYYY-MM-DD" format
    }));

    return Response.json({ data: formattedData }, { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
}
