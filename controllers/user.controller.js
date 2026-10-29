const userServices = require("../services/user.services");

class UserController {
    async signup(req, res) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    message: "Name, email, and password are required",
                });
            }

            const user = await userServices.createUser({ name, email, password });
            const userResponse = user.toObject();
            delete userResponse.password;

            return res.status(201).json({
                message: "User created successfully",
                user: userResponse,
            });
        } catch (error) {
            console.error("Error in signup controller:", error);

            if (error.code === 11000) {
                return res.status(409).json({
                    message: "Email is already registered",
                });
            }

            return res.status(500).json({
                message: "Unable to create user",
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: "Email and password are required",
                });
            }

            const { user, token } = await userServices.login(email, password);

            return res.status(200).json({
                message: "User logged in successfully",
                user,
                token,
            });
        } catch (error) {
            console.error("Error in login controller:", error);
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
    }

    async update(req, res) {
        try {
            if (req.user.id !== req.params.id) {
                return res.status(403).json({
                    message: "You can only update your own account",
                });
            }

            const allowedFields = ["name", "email", "password"];
            const updates = Object.fromEntries(
                Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
            );

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    message: "At least one of name, email, or password is required",
                });
            }

            const user = await userServices.updateUser(req.params.id, updates);
            return res.status(200).json({
                message: "User updated successfully",
                user,
            });
        } catch (error) {
            console.error("Error in update controller:", error);

            if (error.code === 11000) {
                return res.status(409).json({
                    message: "Email is already registered",
                });
            }

            if (error.name === "ValidationError") {
                return res.status(400).json({
                    message: error.message,
                });
            }

            if (error.name === "CastError") {
                return res.status(400).json({
                    message: "Invalid user id",
                });
            }

            if (error.message === "User not found") {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            return res.status(500).json({
                message: "Unable to update user",
            });
        }
    }

    async delete(req, res) {
        try {
            if (req.user.id !== req.params.id) {
                return res.status(403).json({
                    message: "You can only delete your own account",
                });
            }

            await userServices.deleteUser(req.params.id);
            return res.status(200).json({
                message: "User deleted successfully",
            });
        } catch (error) {
            console.error("Error in delete controller:", error);

            if (error.name === "CastError") {
                return res.status(400).json({
                    message: "Invalid user id",
                });
            }

            if (error.message === "User not found") {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            return res.status(500).json({
                message: "Unable to delete user",
            });
        }
    }
}

module.exports = new UserController();