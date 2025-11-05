import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json()); // Parse URL-encoded data

let rToken = [];
const posts = [
  {
    user: "ahmed",
    post: "my name is ahmed",
  },
  {
    user: "ali",
    post: "my name is ali",
  },
  {
    user: "abdulqani",
    post: "lorem",
  },
];

app.get("/posts", authurize_user, (req, res) => {
  console.log(req.user);
  res.json(posts.filter((post) => post.user === req.user.name)); //just the name
});

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.statusCode(401);
  if (!rToken.includes(refreshToken)) return res.statusCode(403);

  jwt.verify(refreshToken, process.env.REF_SECRET, (err, user) => {
    if (err) return res.statusCode(403);
    const accessToken = CreatJwt({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const user = { name: username };
  const token = CreatJwt(user);
  const refreshToken = jwt.sign(user, process.env.REF_SECRET);
  rToken.push(refreshToken);
  //   const token = jwt.sign(user, process.env.JWT_SECRET);
  res.json({ token: token, refreshToken: refreshToken });
});
function CreatJwt(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "15s" });
}

app.delete("/logout", (req, res) => {
  rToken = rToken.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});
app.get("/", (req, res) => {
  res.send("hi");
});

app.listen(3000, () => {
  console.log("lestening . . .");
});

//middle-ware
function authurize_user(req, res, next) {
  //get the token that is in header
  const auth_header = req.headers["authorization"];
  const token = auth_header && auth_header.split(" ")[1];
  console.log(token);

  if (token == null) {
    res.status(401).json({ message: "Aceess denied no token provided" });
  }
  const ver_jwt = jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ message: "invalid or expired token" });
    }
    req.user = user; //now req.user =  jwt payload
    next();
  });
}
