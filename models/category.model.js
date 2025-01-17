const mongoose = require("mongoose");
const { Schema } = mongoose;
const categorySchema = new Schema({
  category: String,
});

const category = mongoose.model("category", categorySchema);

module.exports = category;
