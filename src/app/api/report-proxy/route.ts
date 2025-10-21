export async function GET() {
  try {
    const pdfResponse = await fetch("http://localhost:4000/report");

    if (!pdfResponse.ok) {
      throw new Error(`PDF Server Error: ${pdfResponse.statusText}`);
    }

    const buffer = await pdfResponse.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=wellness_report.pdf",
      },
    });
  } catch (err: any) {
    console.error("Proxy PDF error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
