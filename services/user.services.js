const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const tokenService = require("../jwt/token.json.service");
class UserService {
    async createUser({ name, email, password }) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error("Email is already registered");
            error.code = 11000;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        return User.create({
            name,
            email,
            password: hashedPassword,
        });
    }

    async signup(name, email, password) {
        return this.createUser({ name, email, password });
    }
    async login(email,password)
    {
        const user = await User.findOne({email}).select("+password");
        if(!user)
        {
            throw new Error("User not found");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid)
        {
            throw new Error("Invalid password");
        }
        const payload = { id: user._id, email: user.email ,isActive :user.isActive};
        const token = tokenService.generateToken(payload);
        const userWithputPassword = user.toObject();
        delete userWithputPassword.password;
        return { user: userWithputPassword, token };
    }

    async updateUser(userId, updates) {
        const updateData = { ...updates };

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const user = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!user) {
            throw new Error("User not found");
        }

        const userResponse = user.toObject();
        delete userResponse.password;
        return userResponse;
    }

    async deleteUser(userId) {
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            throw new Error("User not found");
        }
    }
}
module.exports = new UserService();