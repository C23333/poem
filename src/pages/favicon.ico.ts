export const prerender = true;

const favicon = new Uint8Array([
  0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 32, 0, 48, 0,
  0, 0, 22, 0, 0, 0, 40, 0, 0, 0, 1, 0, 0, 0, 2, 0,
  0, 0, 1, 0, 32, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  163, 54, 37, 255, 0, 0, 0, 0
]);

export function GET() {
  return new Response(favicon, {
    headers: {
      "Content-Type": "image/x-icon",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
