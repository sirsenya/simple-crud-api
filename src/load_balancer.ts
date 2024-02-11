import { server } from "./server";
import { getBodyData } from "./controllers/user_controller";
import { config } from "dotenv";
import cluster, { Worker } from "cluster";
import * as http from "http";
import os from "os";

config();

const port: number = parseInt(process.env.PORT!) || 4000;

if (cluster.isPrimary) {
  const servers: string[] = [];
  const workers: Worker[] = [];
  const ports: number[] = [];
  let currentServer: number = 0;

  const quantityOfStreams = os.availableParallelism() - 1;
  for (let i = 0; i < quantityOfStreams + 1; i++) {
    servers.push(`http://localhost:${port + i}`);
    ports.push(port + i);
  }

  for (let i = 0; i < quantityOfStreams; i++) {
    const newWorker = cluster.fork();
    workers.push(newWorker);
  }

  workers.forEach((worker) => {
    worker.on("message", (data: string) => {
      const workerData = JSON.parse(data);
      if (workerData.action === "update") {
        //  console.log(`worker got message update = ${workerData.value[0].username}`);
        workers.forEach((worker) =>
          worker.send(JSON.stringify({ users: workerData.value }))
        );
      }
    });
  });

  const masterServer = http.createServer(
    async (req: http.IncomingMessage, res: http.ServerResponse) => {
      res.setHeader("Content-Type", "application/json");
      const body =
        req.method === "POST" || req.method === "PUT"
          ? await getBodyData(req)
          : {};
      const requestData = JSON.stringify(body);

      if (currentServer < quantityOfStreams) {
        currentServer = currentServer + 1;
        console.log(`currentServer < streamsNumber ${currentServer}`);
      } else {
        currentServer = 1;
      }
      const destination = `${servers[currentServer]}${req.url}`;

      console.log(`${req.method} sent to ${destination}`);

      const requestOptions: http.RequestOptions = {
        hostname: "localhost",
        port: ports[currentServer],
        path: req.url,
        method: req.method,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestData),
        },
      };

      const request = http.request(
        requestOptions,
        async (response: http.IncomingMessage) => {
          response.setEncoding("utf8");
          if (response.statusCode === undefined) {
            throw Error(
              "response.statusCode === undefined in load_balancer.ts"
            );
          }
          res.statusCode = response.statusCode;
          if (res.statusCode == 204) {
            res.end();
          }
          response.on("data", (chunk: any) => {
            res.end(chunk);
          });
        }
      );

      if (req.method !== "GET") {
        request.write(requestData);
      }

      request.end();
    }
  );

  masterServer.listen(port, "localhost", () => [
    console.log(`Started master ${process.pid} on ${port} port`),
  ]);
} else {
  const workerId: number = (cluster.worker as Worker).id;
  const childPort: number = port + workerId;
  const app: http.Server = server;
  app.listen(childPort, "localhost", () => {
    console.log(`Started worker ${process.pid} on ${childPort} port`);
  });
}
