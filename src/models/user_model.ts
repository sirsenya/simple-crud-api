//import users from "../data/products.json" with { "type": "json" };
import { v4 } from "uuid";
import { users } from "../db/db";
import cluster from "cluster";

export class User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
  constructor({
    id,
    username,
    age,
    hobbies,
  }: {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
  }) {
    (this.id = id),
      (this.username = username),
      (this.age = age),
      (this.hobbies = hobbies);
  }
}

export function findAll() {
  return new Promise((resolve, reject) => {
    resolve(users);
  });
}

export function findById(id: string): Promise<User | undefined> {
  return new Promise((resolve, reject) => {
    const user = users.find((p) => p.id === id);
    resolve(user);
  });
}

export function create(data: {
  username: string;
  age: number;
  hobbies: string[];
}) {
  const { username, age, hobbies } = data;
  return new Promise((resolve, reject) => {
    const newUser = new User({
      id: v4(),
      username: username,
      age: age,
      hobbies: hobbies,
    });
    users.push(newUser);
    if (cluster.isWorker) {
      updateDb("users", users);
    }
    resolve(newUser);
  });
}
export function update(data: User) {
  const id = data.id;
  return new Promise((resolve, reject) => {
    const index = users.findIndex((p) => p.id === id);
    users[index] = data;
    if (cluster.isWorker) {
      updateDb("users", users);
    }
    resolve(users[index]);
  });
}

export function remove(id: string) {
  return new Promise((resolve, reject) => {
    const index = users.findIndex((p) => p.id === id);
    users.splice(index, 1);
    console.log(`DELETED ${id}`);
    if (cluster.isWorker) {
      updateDb("users", users);
    }
    resolve(id);
  });
}

const updateDb = (key: string, value: unknown) => {
  process.send &&
    process.send(JSON.stringify({ action: "update", key, value }));
};
