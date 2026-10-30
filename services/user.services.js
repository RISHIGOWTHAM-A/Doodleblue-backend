const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../jwt/token.json.service");

class UserService {
  async signup({ name, email, password, role }) {
    const existing = await User.findOne({ email });
    if (existing) throw new Error("Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });

    // Sign a JWT on signup too, so the client can log in immediately
    const token = generateToken({ id: user._id, email: user.email, role: user.role });

    const userObj = user.toObject();
    delete userObj.password;
    return { user: userObj, token };
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid email or password");
    if (user.isDeleted) throw new Error("Account is deleted or deactivated");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    // Pass role as payload in JWT token
    const token = generateToken({ id: user._id, email: user.email, role: user.role });

    const userObj = user.toObject();
    delete userObj.password;
    return { user: userObj, token };
  }

  async getProfile(userId) {
    return User.findOne({ _id: userId, isDeleted: false }).select("-password");
  }

  async getAllStudents() {
    return User.find({ role: "student", isDeleted: false }).select("-password");
  }

  async getAllFaculty() {
    return User.find({ role: "faculty", isDeleted: false }).select("-password");
  }

  async getStudentById(id) {
    return User.findOne({ _id: id, role: "student", isDeleted: false }).select("-password");
  }

  async updateStudent(id, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return User.findOneAndUpdate(
      { _id: id, role: "student", isDeleted: false },
      data,
      { returnDocument: "after" }
    ).select("-password");
  }

  async deleteStudent(id) {
    return User.findOneAndDelete({ _id: id, role: "student" });
  }
}

module.exports = new UserService();