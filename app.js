require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user.routes");

const app = express();
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend API is running" });
});

const port = process.env.PORT || 3003;

if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
  });
}

module.exports = app;
