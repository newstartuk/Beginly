import { landingHtml } from "./_landing-html";

// Serves the fully self-contained marketing landing page for beginly.app.
// This bypasses the shared React layout/rendering pipeline intentionally,
// since the page is a standalone HTML/CSS/JS document (with an inline
// animated "how it works" demo and audio) built outside the Next.js app.
export async function GET() {
  return new Response(landingHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
