import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "./controllers/user_controller";
import http from "http";

export const server = http.createServer((req, res) => {
  if (req.url === "/api/users" && req.method === "GET") {
    getUsers(req, res);
  } else if (req.url!.match(/\/api\/users\/(.+)/) && req.method === "GET") {
    const id = req.url!.split("/")[3];
    getUser(req, res, id);
  } else if (req.url === "/api/users" && req.method === "POST") {
    createUser(req, res);
  } else if (req.url!.match(/\/api\/users\/(.+)/) && req.method === "PUT") {
    const id = req.url!.split("/")[3];
    updateUser(req, res, id);
  } else if (req.url!.match(/\/api\/users\/(.+)/) && req.method === "DELETE") {
    const id = req.url!.split("/")[3];
    deleteUser(req, res, id);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});
