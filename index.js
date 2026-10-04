require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("ejs");
const PORT = 3000;
const app = express();
const allowedOrigins = [
  "https://ahmed-mostafa-3d-portfolio.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",
];
app.use(
  cors({
    origin(origin, callback) {
      const isPortfolioPreview =
        typeof origin === "string" &&
        /^https:\/\/ahmed-mostafa-3d-portfolio(?:-[a-z0-9-]+)?\.vercel\.app$/.test(
          origin,
        );
      if (!origin || allowedOrigins.includes(origin) || isPortfolioPreview) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
  }),
);
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const Reviews = require("./models/reviews");

const requiredEnv = ["USER_NAME", "PASSWORD", "CLUSTER_NAME", "DATABASE_NAME"];

function getMongoUri() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  const user = encodeURIComponent(process.env.USER_NAME);
  const password = encodeURIComponent(process.env.PASSWORD);
  const appName = encodeURIComponent(process.env.DATABASE_NAME);
  return `mongodb+srv://${user}:${password}@${process.env.CLUSTER_NAME}.sqh4eos.mongodb.net/?appName=${appName}`;
}

let connectionPromise;

function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(getMongoUri(), {
        family: 4,
        serverSelectionTimeoutMS: 8000,
      })
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((err) => {
        connectionPromise = null;
        throw err;
      });
  }

  return connectionPromise;
}

connectDB().catch((err) => {
  console.log(err);
});

app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({
      message: "Database connection failed",
      error: err.message,
    });
  }
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
app.post("/api/reviews", async (req, res) => {
  try {
    const review = new Reviews({
      name: req.body.name,
      email: req.body.email,
      company: req.body.company,
      position: req.body.position,
      date: req.body.date || new Date(),
      review: req.body.review,
    });
    // for postman we can use the following code:
    // {
    //   "name": "John Doe",
    //   "email": "john.doe@example.com",
    //   "company": "Example Inc.",
    //   "position": "Software Engineer",
    //   "date": "2026-01-01",
    //   "review": "This is a test review"
    // }
    await review.save();
    res.status(200).json({ message: "Review created successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Review creation failed", error: err.message });
  }
});
// for all articles
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Reviews.find();
    const filteredReviews = reviews
      .map((review) => {
        return {
          id: review._id,
          name: review.name,
          email: review.email,
          company: review.company,
          position: review.position,
          date: review.date.toISOString(),
          review: review.review,
        };
      })
      .sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
    res.status(200).json(filteredReviews);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Review fetching failed", error: err.message });
  }
});
// for specific article
app.get("/api/reviews/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const review = await Reviews.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json(review);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Review fetching failed", error: err.message });
  }
});

// for update article
app.put("/api/reviews/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email, company, position, date, review } = req.body;
  try {
    const SpecificReview = await Reviews.findByIdAndUpdate(id, {
      name,
      email,
      company,
      position,
      date,
      review,
    });
    res.status(200).json(SpecificReview);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Review updating failed", error: err.message });
  }
});
// for patch article
app.patch("/api/reviews/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email, company, position, date, review } = req.body;
  try {
    const SpecificReview = await Reviews.findByIdAndUpdate(id, {
      name,
      email,
      company,
      position,
      date,
      review,
    });
    res.status(200).json(SpecificReview);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Review patching failed", error: err.message });
  }
});
// for delete review
app.delete("/api/reviews/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const review = await Reviews.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json(review);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Review deleting failed", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
