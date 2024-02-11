import supertest from "supertest";
import { listen } from "./index";
import { User } from "./models/user_model";
import { validate } from "uuid";

describe("Server", () => {
  const request = supertest.agent(listen);
  let createdUser: User;

  afterAll((done) => {
    listen.close(done);
  });

  it("should get an empty array from /api/users", async () => {
    const res = await request.get("/api/users");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("responds with json", async () => {
    const username = "new user";
    const hobbies = ["hobbie1", "hobbie2"];
    const age = 44;

    const res = await request
      .post("/api/users")
      .send({
        username: username,
        hobbies: hobbies,
        age: age,
      })
      .set("Accept", "application/json");

    createdUser = res.body;
    expect(res.status).toBe(201);
    expect(createdUser.username).toBe(username);
    expect(createdUser.hobbies).toEqual(hobbies);
    expect(createdUser.age).toBe(age);
    expect(validate(createdUser.id)).toBeTruthy();
  });

  it("should get a newly created user /api/users/:id", async () => {
    const res = await request.get(`/api/users/${createdUser.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(createdUser);
  });

  it("should update a newly created user /api/users/:id", async () => {
    const initialId = createdUser.id;
    const username = "updated user";
    const hobbies = ["updated hobbie1", "updated hobbie2"];
    const age = 54;
    const res = await request
      .put(`/api/users/${initialId}`)
      .send({
        username: username,
        hobbies: hobbies,
        age: age,
      })
      .set("Accept", "application/json");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: initialId,
      username: username,
      hobbies: hobbies,
      age: age,
    });
  });

  it("should delete a newly updated user /api/users/:id", async () => {
    const url: string = `/api/users/${createdUser.id}`;
    const resDelete = await request
      .delete(url)
      .set("Accept", "application/json");
    expect(resDelete.status).toBe(204);
  });

  it("should not find a deleted user /api/users/:id", async () => {
    const url: string = `/api/users/${createdUser.id}`;
    const resGet = await request.get(url);
    expect(resGet.status).toBe(404);
  });
});

// Get all records with a GET api/users request (an empty array is expected)
// A new object is created by a POST api/users request (a response containing newly created record is expected)
// With a GET api/user/{userId} request, we try to get the created record by its id (the created record is expected)
// We try to update the created record with a PUT api/users/{userId}request (a response is expected containing an updated object with the same id)
// With a DELETE api/users/{userId} request, we delete the created object by id (confirmation of successful deletion is expected)
// With a GET api/users/{userId} request, we are trying to get a deleted object by id (expected answer is that there is no such object)
