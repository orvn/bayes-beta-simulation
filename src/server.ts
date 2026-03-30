const htmlFile = Bun.file(new URL("../bayes-beta.htm", import.meta.url));

const port = Number(process.env.PORT) || 6800;

Bun.serve({
  port,
  fetch(req) {
    const pathname = new URL(req.url).pathname;
    if (pathname === "/" || pathname === "/bayes-beta.htm") {
      return new Response(htmlFile, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Serving bayes-beta.htm at http://localhost:${port}/`);
