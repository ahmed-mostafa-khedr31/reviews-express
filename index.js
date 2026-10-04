require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
require("ejs");
const PORT = 3000;
const app = express();
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const Article = require("./models/articles");

mongoose
  .connect(
    `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@${process.env.CLUSTER_NAME}.sqh4eos.mongodb.net/?appName=${process.env.DATABASE_NAME}`,
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.status(200).render("error", { error: null, message: "Hello World!" });
});
// app.post("/api/get-sum/:num1/:num2", (req, res) => {
//   const num1 = req.params.num1;
//   const num2 = req.params.num2;
//   const sum = Number(num1) + Number(num2);

//   res.status(200).json({
//     message: `Sum of two numbers is ${num1} and ${num2} is ${sum}`,
//     sum: sum,
//   });
// });
// for create article
app.post("/api/articles", async (req, res) => {
  try {
    const article = new Article({
      title: req.body.title,
      date: req.body.date || new Date(),
      content: req.body.content,
    });
    // for postman we can use the following code:
    // {
    //   "title": "Test Article",
    //   "date": "2026-01-01",
    //   "content": "This is a test article"
    // }
    await article.save();
    res.status(200).json({ message: "Article created successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Article creation failed", error: err.message });
  }
});
// for all articles
app.get("/api/articles", async (req, res) => {
  try {
    const articles = await Article.find();
    const filteredArticles = articles
      .map((article) => {
        return {
          id: article._id,
          title: article.title,
          date: article.date.toISOString(),
          content: article.content,
        };
      })
      .sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
    res.status(200).json(filteredArticles);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Article fetching failed", error: err.message });
  }
});
// for specific article
app.get("/api/articles/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json(article);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Article fetching failed", error: err.message });
  }
});

// for update article
app.put("/api/articles/:id", async (req, res) => {
  const id = req.params.id;
  const { title, date, content } = req.body;
  try {
    const article = await Article.findByIdAndUpdate(id, {
      title,
      date,
      content,
    });
    res.status(200).json(article);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Article updating failed", error: err.message });
  }
});
// for patch article
app.patch("/api/articles/:id", async (req, res) => {
  const id = req.params.id;
  const { title, date, content } = req.body;
  try {
    const article = await Article.findByIdAndUpdate(id, {
      title,
      date,
      content,
    });
    res.status(200).json(article);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Article patching failed", error: err.message });
  }
});
// for delete article
app.delete("/api/articles/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const article = await Article.findByIdAndDelete(id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json(article);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Article deleting failed", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
