const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: "Authentication required before role authorization",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Role '${req.user.role}' is not authorized to access this resource. Allowed roles: ${allowedRoles.join(", ")}`,
            });
        }

        next();
    };
};

module.exports = { authorizeRoles };
