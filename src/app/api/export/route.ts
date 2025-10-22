import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabaseServer"
import PDFDocument from "pdfkit"
import fs from "fs"
import path from "path"
import { PassThrough } from "stream"

export async function GET() {
  try {
    // ✅ Create Supabase client
    const supabase = await createSupabaseServer()

    // ✅ Query wellness data
    const { data, error } = await supabase
      .from("wellness")
      .select("created_at, mood_level, sleep_hours, exercise_minutes, journal_entry")
      .order("created_at", { ascending: true })

    if (error) throw error
    if (!data || data.length === 0) {
      return NextResponse.json({ message: "No data available" }, { status: 404 })
    }

    // ✅ Initialize PDF and stream
    const stream = new PassThrough()
    const doc = new PDFDocument({ margin: 50 })

    // ✅ Register Roboto Mono font (prevents Helvetica.afm error)
    const fontPath = path.join(process.cwd(), "public", "fonts", "RobotoMono-Regular.ttf")
    if (!fs.existsSync(fontPath)) {
      console.error("Font file not found:", fontPath)
      throw new Error(`Font not found at ${fontPath}`)
    }

    doc.registerFont("RobotoMono", fontPath)
    doc.font("RobotoMono")

    // ✅ Pipe PDF to stream
    doc.pipe(stream)

    // ---------- PDF CONTENT ----------
    doc.fontSize(18).text("Wellness Progress Report", { align: "center" })
    doc.moveDown()
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`)
    doc.moveDown()

    // Summary averages
    const avgMood =
      data.reduce((a, r) => a + (r.mood_level || 0), 0) / data.length
    const avgSleep =
      data.reduce((a, r) => a + (r.sleep_hours || 0), 0) / data.length
    const avgExercise =
      data.reduce((a, r) => a + (r.exercise_minutes || 0), 0) / data.length

    doc.text(`Average Mood: ${avgMood.toFixed(2)}`)
    doc.text(`Average Sleep: ${avgSleep.toFixed(2)} hours`)
    doc.text(`Average Exercise: ${avgExercise.toFixed(2)} minutes`)
    doc.moveDown()

    // Entries
    doc.fontSize(14).text("Entries", { underline: true })
    doc.moveDown(0.5)

    data.forEach((r) => {
      doc.fontSize(12).text(
        `${new Date(r.created_at).toLocaleDateString()} — Mood: ${r.mood_level ?? "N/A"}, Sleep: ${r.sleep_hours ?? "N/A"}h, Exercise: ${r.exercise_minutes ?? "N/A"}m`
      )
      if (r.journal_entry) {
        doc.fontSize(10).fillColor("gray").text(`"${r.journal_entry}"`)
        doc.fillColor("black")
      }
      doc.moveDown(0.5)
    })

    // Finalize PDF
    doc.end()

    // ✅ Convert stream to buffer
    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const chunks: Buffer[] = []
      stream.on("data", (chunk) => chunks.push(chunk))
      stream.on("end", () => resolve(Buffer.concat(chunks)))
    })

    // ✅ Return PDF response (typed-safe)
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          "attachment; filename=wellness_report.pdf",
      },
    })
  } catch (err: any) {
    console.error("PDF export error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
