import { Elysia, t } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { swagger } from "@elysiajs/swagger";
import { BooksDatabase } from "./db";

const app = new Elysia()
  .onError(({ code, error }) => {
    let status;
    switch (code) {
      case "VALIDATION":
        status = 400;
        break;
      case "NOT_FOUND":
        status = 404;
        break;
      default:
        status = 500;
        break;
    }
    return new Response(JSON.stringify({ error }), { status });
  })
  .use(cookie())
  .use(
    jwt({
      name: "jwt",
      secret: "supersecret",
    })
  )
  .use(swagger())
  .decorate("db", new BooksDatabase());

app.get("/books", ({ db }) => db.getBooks());
app.post("/books", ({ db, body }) => db.addBock(body), {
  body: t.Object({
    name: t.String(),
    author: t.String(),
  }),
});
app.put(
  "/books",
  ({ db, body }) =>
    db.updateBook(body.id, { name: body.name, author: body.author }),
  {
    body: t.Object({
      id: t.Number(),
      name: t.String(),
      author: t.String(),
    }),
  }
);
app.get("/books/:id", async ({ db, params, jwt, cookie: { auth } }) => {
  const profile = await jwt.verify(auth);
  // console.log(profile);
  if (!profile) return new Error("Not Authorized");
  else return db.getBook(parseInt(params.id));
});
app.delete("/books/:id", ({ db, params }) =>
  db.deleteBook(parseInt(params.id))
);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
