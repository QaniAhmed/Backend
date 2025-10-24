import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
let id = 3;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "country_food",
  password: "admin",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;
let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];

async function checkVisisted() {
  const result = await db.query(
    "SELECT country_code FROM visited_countries vc JOIN users ON users.id = vc.user_id WHERE user_id =$1",
    [currentUserId]
  );
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  // console.log(countries);
  return countries;
}

async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;
  return users.find((user) => user.id == currentUserId);
}

app.get("/", async (req, res) => {
  let currentUser = await getCurrentUser();
  console.log("currentUser", currentUser);
  const countries = await checkVisisted(); //To currentUser
  console.log(countries);
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentUser.color,
  });
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];
  console.log("the input", input);

  try {
    const result = await db.query(
      "SELECT c_code FROM countries WHERE c_name LIKE '%' || $1 || '%' ; ",
      [input]
    );

    const data = result.rows[0];
    console.log(data);
    const countryCode = data.c_code;
    console.log(
      "the add process currentUserId ",
      currentUserId,
      " countryCode ",
      countryCode
    );
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
        [countryCode, currentUserId]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log("ERROR HAPPEND", err);
    res.redirect("/");
  }
});
app.post("/user", async (req, res) => {
  if (req.body.add === "new") {
    res.render("new.ejs");
  } else {
    currentUserId = req.body.user;
    res.redirect("/");
  }
});
app.post("/new", async (req, res) => {
  //get the name & color
  const name = req.body.name;
  const color = req.body.color;
  //insert
  const result = await db.query(
    "insert into users(id,name,color) values($1,$2,$3)",
    [id++, name, color]
  );
  res.redirect("/");
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
