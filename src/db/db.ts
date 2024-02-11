import { User } from "../models/user_model";

export let users: User[] = [];

process.on("message", (data: Buffer) => {
  const message = JSON.parse(data.toString());
  users = message.users;
});
