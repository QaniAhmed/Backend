import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
const app = express();

//connect to the wether api
app.get("/", async (req, res) => {
  const response = await axios.get(
    "http://api.weatherapi.com/v1/current.json?key=XXXXXXXXXX&q=riyadh&aqi=no"
  );
  const result = response.data;
  console.log(result);
  const responst_obj = {
    county: result.location.country,
    name: result.location.name,
    weather: result.current.condition.text,
  };
  res.json(responst_obj);
});

app.listen(3000, () => {
  console.log("lestening . . .");
});
