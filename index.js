import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

// Configure and connect to the PostgreSQL database
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Permalist",
    password: "Abishek@2",
    port: 5432,
});

db.connect()
    .then(() => console.log("Connected to the database"))
    .catch((err) => console.error("Database connection failed:", err.stack));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
    { id: 1, title: "Buy milk" },
    { id: 2, title: "Finish homework" },
];

// Fetch items from the database
async function getItems() {
    try {
        const itemsResult = await db.query("SELECT * FROM items");
        return itemsResult.rows;
    } catch (err) {
        console.error("Error fetching items:", err.message);
        return [];
    }
}

// Routes
app.get("/", async (req, res) => {
    try {
        items = await getItems();
        res.render("index.ejs", {
            listTitle: "Today",
            listItems: items,
        });
    } catch (err) {
        console.error("Error rendering home page:", err.message);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/add", async (req, res) => {
    const item = req.body.newItem;
    try {
        await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
        res.redirect("/");
    } catch (err) {
        console.error("Error adding item:", err.message);
        res.status(500).send("Error adding item");
    }
});

app.post("/edit", async (req, res) => {
    const id = req.body.updatedItemId;
    const title = req.body.updatedItemTitle;
    try {
        await db.query("UPDATE items SET title = $1 WHERE id = $2", [
            title,
            id,
        ]);
        res.redirect("/");
    } catch (err) {
        console.error("Error updating item:", err.message);
        res.status(500).send("Error updating item");
    }
});

app.post("/delete", async (req, res) => {
    const id = req.body.deleteItemId;
    try {
        await db.query("DELETE FROM items WHERE id = $1", [id]);
        res.redirect("/");
    } catch (err) {
        console.error("Error deleting item:", err.message);
        res.status(500).send("Error deleting item");
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
