import { createPromiseClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { PriceService } from "../gen/price_connect";

const transport = createConnectTransport({
  baseUrl: "http://localhost:8080",
  useBinaryFormat: false,
});

export const priceClient = createPromiseClient(PriceService, transport);
