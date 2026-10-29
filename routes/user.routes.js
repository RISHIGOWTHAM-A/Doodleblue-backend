const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Auth
router.post("/signup", (req, res) => userController.signup(req, res));
router.post("/login", (req, res) => userController.login(req, res));

// Profile
router.get("/profile", authMiddleware, (req, res) => userController.getProfile(req, res));

// Role based lists (Faculty only)
router.get("/students", authMiddleware, (req, res) => userController.getAllStudents(req, res));
router.get("/faculties", authMiddleware, (req, res) => userController.getAllFaculty(req, res));

// Student operations (view, update, soft-delete)
router.get("/students/:id", authMiddleware, (req, res) => userController.getStudentById(req, res));
router.patch("/students/:id", authMiddleware, (req, res) => userController.updateStudent(req, res));
router.delete("/students/:id", authMiddleware, (req, res) => userController.deleteStudent(req, res));

// View user by ID (enforcing student privacy & faculty-to-faculty restriction)
router.get("/:id", authMiddleware, (req, res) => userController.getUserById(req, res));

module.exports = router;