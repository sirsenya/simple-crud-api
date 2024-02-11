import http from "http";
import {
  findAll,
  findById,
  create,
  update,
  remove,
  User,
} from "../models/user_model";
import { validate } from "uuid";

interface UserInput {
  username: string;
  age: number;
  hobbies: string[];
}

//@desc Gets All Users
//@route GET /api/users
export async function getUsers(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  try {
    const users = await findAll();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "server-side error" }));
  }
}

//@desc Gets single User
//@route GET /api/user/:id
export async function getUser(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  id: string
) {
  if (validate(id)) {
    try {
      const user = await findById(id);

      if (!user) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "User not found" }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(user));
      }
    } catch (error) {
      console.error(error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "server-side error" }));
    }
  } else {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Invalid id (not uuid)" }));
  }
}

//@desc Create a User
//@route POST /api/users
export async function createUser(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  function checkCreateUserInput(userInput: UserInput): Boolean {
    if (
      "username" in userInput &&
      "age" in userInput &&
      "hobbies" in userInput &&
      typeof userInput.age === "number" &&
      typeof Array.isArray(userInput.hobbies) &&
      typeof userInput.username === "string"
    ) {
      return true;
    } else {
      return false;
    }
  }

  try {
    const body = await getBodyData(req);
    if (!body) {
      res.writeHead(400, { "Content-type": "application/json" });
      return res.end("please pass JSON-body");
    }
    if (checkCreateUserInput(body)) {
      const { username, age, hobbies } = body;

      const user = {
        username,
        age,
        hobbies,
      };

      const newUser = await create(user);
      res.writeHead(201, { "Content-type": "application/json" });
      return res.end(JSON.stringify(newUser));
    } else {
      res.writeHead(400, { "Content-type": "application/json" });
      return res.end(
        "please fill the body with required fields of correct type : 'username': string, 'age': number, 'hobbies': string[]"
      );
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "server-side error" }));
  }
}

//@desc Update a User
//@route PUT /api/users/:id
export async function updateUser(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  id: string
) {
  if (validate(id)) {
    try {
      const user = await findById(id);

      if (!user) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "User not found" }));
      } else {
        const body = await getBodyData(req);

        if (!body) {
          res.writeHead(400, { "Content-type": "application/json" });
          return res.end("please pass JSON-body");
        }

        const { username, hobbies, age } = body;

        const userData: User = {
          id: id,
          username: username || user.username,
          hobbies: hobbies || user.hobbies,
          age: age || user.age,
        };

        const updUser = await update(userData);
        res.writeHead(200, { "Content-type": "application/json" });
        return res.end(JSON.stringify(updUser));
      }
    } catch (error) {
      console.error(error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "server-side error" }));
    }
  } else {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Invalid id (not uuid)" }));
  }
}

//@desc Deletes single User
//@route DELETE /api/user/:id
export async function deleteUser(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  id: string
) {
  if (validate(id)) {
    try {
      const user = await findById(id);

      if (!user) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "User not found" }));
      } else {
        await remove(id);
        res.writeHead(204, { "Content-Type": "application/json" });
        res.end();
      }
    } catch (error) {
      console.error(error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "server-side error" }));
    }
  } else {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Invalid id (not uuid)" }));
  }
}

export function getBodyData(
  req: http.IncomingMessage
): Promise<UserInput | null> {
  return new Promise((resolve, reject) => {
    try {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        let parsedBody: UserInput | null;
        try {
          parsedBody = JSON.parse(body);
        } catch (error) {
          parsedBody = null;
        }
        resolve(parsedBody);
      });
    } catch (error) {
      reject(error);
    }
  });
}
