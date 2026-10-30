const userServices = require("../services/user.services");

class UserController {
  // 1. Signup: credentials + role (student or faculty)
  async signup(req, res) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required (name, email, password, role)" });
      }
      if (!["student", "faculty"].includes(role)) {
        return res.status(400).json({ message: "Role must be 'student' or 'faculty'" });
      }

      const result = await userServices.signup({ name, email, password, role });
      res.status(201).json({ message: "Signup successful", ...result });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 2. Login: role is passed as payload in JWT token
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const result = await userServices.login(email, password);
      res.status(200).json({ message: "Login successful", ...result });
    } catch (error) {
      const status = error.message.includes("deleted") ? 403 : 401;
      res.status(status).json({ message: error.message });
    }
  }

  // 3. View own profile after login
  async getProfile(req, res) {
    try {
      const user = await userServices.getProfile(req.user.id);
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 4. GetAllStudents: Faculty only, student forbidden
  async getAllStudents(req, res) {
    try {
      if (req.user.role !== "faculty") {
        return res.status(403).json({ message: "Access denied: Only faculty can view all students" });
      }
      const students = await userServices.getAllStudents();
      res.status(200).json({ students });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 5. GetAllFaculty: Faculty only, student forbidden
  async getAllFaculty(req, res) {
    try {
      if (req.user.role !== "faculty") {
        return res.status(403).json({ message: "Access denied: Students cannot view faculty data" });
      }
      const faculties = await userServices.getAllFaculty();
      res.status(200).json({ faculties });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 6. View student by id: Faculty can view, student can only view self
  async getStudentById(req, res) {
    try {
      const { id } = req.params;
      if (req.user.role === "student" && req.user.id !== id) {
        return res.status(403).json({ message: "Access denied: Students can only view their own profile" });
      }
      const student = await userServices.getStudentById(id);
      if (!student) return res.status(404).json({ message: "Student not found" });
      res.status(200).json({ student, user: student });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 7. Update student: Faculty can update any student, student can only update self
  async updateStudent(req, res) {
    try {
      const { id } = req.params;
      if (req.user.role === "student" && req.user.id !== id) {
        return res.status(403).json({ message: "Access denied: You can only update your own profile" });
      }
      const updated = await userServices.updateStudent(id, req.body);
      if (!updated) return res.status(404).json({ message: "Student not found" });
      res.status(200).json({ message: "Student updated successfully", student: updated, user: updated });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 8. Delete student: Permanent delete, allowed for faculty
  async deleteStudent(req, res) {
    try {
      const { id } = req.params;
      if (req.user.role !== "faculty") {
        return res.status(403).json({ message: "Access denied: Only faculty can delete students" });
      }
      const deleted = await userServices.deleteStudent(id);
      if (!deleted) return res.status(404).json({ message: "Student not found" });
      res.status(200).json({ message: "Student deleted permanently" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 9. View user by ID:
  // - Student can only view self
  // - Faculty can view student, but NO faculty can view another faculty's profile
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userServices.getProfile(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (req.user.role === "student" && req.user.id !== id) {
        return res.status(403).json({ message: "Access denied: Students can only view their own profile" });
      }
      if (req.user.role === "faculty" && user.role === "faculty" && req.user.id !== id) {
        return res.status(403).json({ message: "Access denied: Faculty cannot view other faculty profiles" });
      }

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new UserController();