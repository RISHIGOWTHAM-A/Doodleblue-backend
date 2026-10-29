require("dotenv").config();
const connectDB = require("./config/db");
const express = require("express");
const userRoutes = require("./routes/user.routes");

const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);

const port = process.env.PORT;

app.get("/", (req, res) => {
    res.status(200).json({ message: "hello world" });
});

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
});
