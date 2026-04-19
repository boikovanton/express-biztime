process.env.NODE_ENV = "test";

const request = require("supertest");
const db = require("../db");
const app = require("../app");

beforeEach(async function () {
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");

  await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('apple', 'Apple', 'Maker of phones')
  `);
});

afterEach(async function () {
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
});

afterAll(async function () {
  await db.end();
});

describe("GET /companies", function () {
  test("Gets list of companies", async function () {
    const resp = await request(app).get("/companies");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      companies: [
        { code: "apple", name: "Apple" }
      ]
    });
  });
});

describe("GET /companies/:code", function () {
  test("Gets one company", async function () {
    const resp = await request(app).get("/companies/apple");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      company: {
        code: "apple",
        name: "Apple",
        description: "Maker of phones",
        invoices: []
      }
    });
  });

  test("Responds with 404 for invalid company", async function () {
    const resp = await request(app).get("/companies/nope");
    expect(resp.statusCode).toEqual(404);
  });
});