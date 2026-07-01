import { NextRequest, NextResponse } from "next/server";

// Extracts plain text from an uploaded .txt, .pdf, or .docx file so the user
// doesn't have to copy/paste the content themselves in Document Helper.
//
// Privacy: the uploaded file is held in memory only for the duration of this
// request. It is never written to disk, logged, or stored anywhere, and this
// route never touches the database. Only the extracted text is returned to
// the browser, which the user can review and edit before using it.
export const runtime = "nodejs";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_RETURNED_CHARS = 20000; // client applies its own 5,000-char cap on top of this

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData().catch(() => null);
    const file = formData?.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file was provided." }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "That file is empty." }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "That file is too large. Please upload a file under 8MB." }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = "";

    if (name.endsWith(".txt") || file.type === "text/plain") {
      text = buffer.toString("utf-8");
    } else if (name.endsWith(".pdf") || file.type === "application/pdf") {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (
      name.endsWith(".docx") ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (name.endsWith(".doc")) {
      return NextResponse.json(
        {
          error:
            "Older .doc files aren't supported — please save the file as .docx in Word (File → Save As → Word Document) or paste the text instead.",
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a .txt, .pdf, or .docx file." },
        { status: 400 }
      );
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return NextResponse.json(
        {
          error:
            "We couldn't find any readable text in that file. It may be a scanned image rather than real text — try pasting the text instead.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: trimmed.slice(0, MAX_RETURNED_CHARS) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("/api/document-helper/extract error:", msg);
    return NextResponse.json(
      { error: "We couldn't read that file. Please try again or paste the text instead." },
      { status: 500 }
    );
  }
}
