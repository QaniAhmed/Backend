import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "premalist",
  password: "admin",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

app.get("/", async (req, res) => {
  try {
    const result = await db.query("select * from items");
    items = result.rows;
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (error) {
    console.log("error to read items", error);
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  const AddItem = db.query("insert into items(title) values ($1)", [item]);
  items.push({ title: item });
  res.redirect("/");
});

app.post("/edit", (req, res) => {
  const item_id = req.body.updatedItemId;
  const new_title = req.body.updatedItemTitle;
  try {
    const updateQuery = db.query("update items set title =$1  where id = $2", [
      new_title,
      item_id,
    ]);
    res.redirect("/");
  } catch (error) {
    console.log("error to update:", error);
  }
});

app.post("/delete", (req, res) => {
  const itemId = req.body.deleteItemId;
  console.log(itemId);
  try {
    const deleteQurey = db.query("delete from items where id=$1", [itemId]);
    res.redirect("/");
  } catch (error) {
    console.log("Error to delete:", error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
