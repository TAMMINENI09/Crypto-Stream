import { createConnectRouter } from "@connectrpc/connect";
import { connectNodeAdapter } from "@connectrpc/connect-node";
import { createServer } from "http";
import { PriceService } from "./gen/price_connect";
import { PriceServiceImpl } from "./services/price-service.js";

const PORT = 8080;

async function main() {
  console.log("🚀 Starting backend server...");

  const handler = connectNodeAdapter({
    routes: (router) => {
      router.service(PriceService, new PriceServiceImpl());
    }
  });

  const server = createServer((req, res) => {
    // Basic CORS for development
    const origin = "http://localhost:3000";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    // For preflight, reflect requested headers if provided, else allow a comprehensive set
    if (req.method === "OPTIONS") {
      const requestedHeaders = req.headers["access-control-request-headers"] as string | undefined;
      const allowHeaders = requestedHeaders && requestedHeaders.length > 0
        ? requestedHeaders
        : [
            "Content-Type",
            "Accept",
            "Authorization",
            "Connect-Protocol",
            "Connect-Protocol-Version",
            "Connect-Timeout-Ms",
            "Connect-Content-Encoding",
            "Connect-Accept-Encoding",
            "X-User-Agent",
            "X-Grpc-Web",
          ].join(", ");
      res.setHeader("Access-Control-Allow-Headers", allowHeaders);

      // Preflight request
      res.writeHead(204);
      res.end();
      return;
    }

    return handler(req, res);
  });

  server.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
  });
}

main().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
