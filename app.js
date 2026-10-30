require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user.routes");

const app = express();

// CORS: allow the frontend (Vite dev server) to call this API.
// Override/extend allowed origins via CLIENT_URL="http://host1,http://host2" in .env
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"];

app.use(cors({ origin: allowedOrigins }));
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
