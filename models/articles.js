const mongoose = require("mongoose");
const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  content: {
    type: String,
    required: true,
  },
});
const Article = mongoose.model("Article", articleSchema);
module.exports = Article;
