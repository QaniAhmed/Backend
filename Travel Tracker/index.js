import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

//connect to the database
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "country_food",
  password: "admin",
  port: 5432,
});
db.connect();

let countries = [];
let c_code;
let error = "";
const app = express();
const port = 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  //qurey to read from db
  const result = await db.query("select country_code from visited_country");
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  console.log(result.rows);
  console.log("total countries is :", countries.length);
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
  });
});

app.post("/add", async (req, res) => {
  //1- get the country that user provided
  let user_country = req.body["country"];
  console.log("country is :" + req.body["country"]);

  //2- find the country code in db
  try {
    c_code = await db.query("select c_code from countries where c_name =$1", [
      user_country,
    ]);
  } catch (error) {
    console.log("Error occurs" + error);
  }
  console.log("c_code.rows.length" + c_code.rows.length);
  if (c_code.rows.length !== 0) {
    let code = c_code.rows[0].c_code;
    try {
      await db.query("INSERT INTO visited_country (country_code) VALUES ($1)", [
        code,
      ]);
      res.redirect("/");
    } catch {
      console.log("Error occurs" + error);
      error = "Duplicate country, choose different country";
      res.render("index.ejs", {
        error: error,
        total: countries.length,
        countries: countries,
      });
    }
  } else {
    console.log("no such a country !!!!");
    error = "Country name does not exist,try again.";
    res.render("index.ejs", {
      error: error,
      total: countries.length,
      countries: countries,
    });
  }
  // 3- back to main page
  // res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
