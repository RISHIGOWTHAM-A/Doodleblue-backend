const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.midleware");

router.post("/signup", (req, res) => userController.signup(req, res));

router.post("/login", (req, res) => userController.login(req, res));

router.patch("/:id", authMiddleware, (req, res) => userController.update(req, res));

router.delete("/:id", authMiddleware, (req, res) => userController.delete(req, res));

module.exports = router;