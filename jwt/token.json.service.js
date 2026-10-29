const jwt = require("jsonwebtoken");
const secretkey = process.env.JWT_SECRET;

class TokenService {    
    generateToken(payload) {
        return jwt.sign(payload, secretkey, { expiresIn: "1h" });
    }
}

module.exports = new TokenService();