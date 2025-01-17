const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: String,
});

const user = mongoose.model("user", userSchema);

module.exports = user;
