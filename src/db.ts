import { Database } from "bun:sqlite";

export interface Book {
  id?: number;
  name: string;
  author: string;
}

export class BooksDatabase {
  private db: Database;
  constructor() {
    this.db = new Database("books.db");
    this.init()
      .then(() => console.log("Database initialized"))
      .catch(console.error);
  }

  async getBooks() {
    return (await this.db.query("SELECT * FROM books").all()) as Book[];
  }
  async addBock(book: Book) {
    return (await this.db
      .query("INSERT INTO books (name, author) VALUES (?, ?) RETURNING id")
      .get(book.name, book.author)) as Book;
  }
  async updateBook(id: number, book: Book) {
    return await this.db.run(
      "UPDATE books SET name = ?, author = ? WHERE id = ?",
      [book.name, book.author, id]
    );
  }

  async deleteBook(id: number) {
    return await this.db.run("DELETE FROM books WHERE id = ?", [id]);
  }

  async getBook(id: number) {
    return (await this.db
      .query(`SELECT * FROM books WHERE id = ${id}`)
      .get()) as Book;
  }
  async init() {
    await this.db.run(`
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                author TEXT
            )
        `);
  }
}
