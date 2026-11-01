/**
 * In-memory stand-in for the Upstash Redis REST API, so the server-rendered
 * share page (`/t/{id}`) reads snapshots without a real database. Speaks
 * only the commands the trip service sends (SET/SETEX/GETEX/INCR/EXPIRE).
 * String replies are base64 only when the client asks for it with the
 * `Upstash-Encoding: base64` header (older clients); newer ones read raw.
 *
 * Run with `node e2e/fake-upstash.ts` (Node strips the types natively).
 */
import { createServer } from "node:http";

const PORT = Number(process.env.FAKE_UPSTASH_PORT ?? 8079);
const store = new Map<string, string>();

function run(
  [command, key, ...args]: string[],
  encode: (value: string) => string,
): unknown {
  switch (command.toUpperCase()) {
    case "SET":
      store.set(key, args[0]);
      return encode("OK");
    case "SETEX":
      store.set(key, args[1]);
      return encode("OK");
    case "GET":
    case "GETEX": {
      const value = store.get(key);
      return value === undefined ? null : encode(value);
    }
    case "INCR": {
      const next = Number(store.get(key) ?? 0) + 1;
      store.set(key, String(next));
      return next;
    }
    case "EXPIRE":
      return store.has(key) ? 1 : 0;
    default:
      throw new Error(`fake-upstash: unsupported command ${command}`);
  }
}

createServer((request, response) => {
  let body = "";
  request.on("data", (chunk) => (body += chunk));
  request.on("end", () => {
    response.setHeader("Content-Type", "application/json");
    const base64 = request.headers["upstash-encoding"] === "base64";
    const encode = (value: string) =>
      base64 ? Buffer.from(value, "utf8").toString("base64") : value;
    try {
      // Auto-pipelining batches commands as `[[cmd, ...], ...]` on /pipeline.
      const parsed = JSON.parse(body) as string[] | string[][];
      const payload = Array.isArray(parsed[0])
        ? (parsed as string[][]).map((command) => ({
            result: run(command, encode),
          }))
        : { result: run(parsed as string[], encode) };
      response.end(JSON.stringify(payload));
    } catch (error) {
      response.statusCode = 400;
      response.end(JSON.stringify({ error: String(error) }));
    }
  });
}).listen(PORT, "127.0.0.1", () => {
  process.stdout.write(`fake-upstash listening on http://127.0.0.1:${PORT}\n`);
});
