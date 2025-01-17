const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectionFunc = require("./databse.connection");
const user = require("./models/user.model");
const category = require("./models/category.model");
const secret = process.env.AUTH_SECRET;
var jwt = require("jsonwebtoken");

dotenv.config();

const app = express();

app.use(express.json());

const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

connectionFunc();

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    const decodedToken = jwt.verify(token, secret);
    const foundUser = await user.findOne({ email: decodedToken.userId });

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = foundUser;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const foundUser = await user.find({ email: email });
    if (foundUser.length !== 0) {
      if (password === foundUser[0].password) {
        const token = jwt.sign(
          {
            userId: foundUser[0].email,
          },
          secret,
          { expiresIn: "1h" }
        );
        res.status(201).json({ email, token });
      } else {
        res.status(401).json({ message: "password entered is wrong" });
      }
    } else {
      res.status(404).json({ message: "email entered not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.post("/category", verifyToken, async (req, res) => {
  try {
    const user = req.user;

    const { categories } = req.body;
    const categoriesInDb = await category.find({});

    const existingCategoryNames = categoriesInDb.map(
      (element) => element.category
    );

    const addCategoryPromises = categories.map(async (categoryName) => {
      if (!existingCategoryNames.includes(categoryName)) {
        const newCategory = new category({
          category: categoryName,
        });
        return await newCategory.save();
      }
    });

    await Promise.all(addCategoryPromises.filter(Boolean));

    res.status(200).json({
      message: "Categories processed successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/category", verifyToken, async (req, res) => {
  try {
    const categories = await category.find({});
    if (categories.length > 0) {
      res.status(200).json({ categories });
    } else {
      return res.status(404).json({ message: "No categories found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
