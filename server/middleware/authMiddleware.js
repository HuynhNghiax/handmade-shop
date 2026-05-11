const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.token;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SEC, (err, user) => {
            if (err) return res.status(403).json("Token không hợp lệ!");
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json("Bạn chưa đăng nhập!");
    }
};

// CÁI NÀY LÀ KHÓA CHỐT CỬA BACKEND
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            res.status(403).json("Lỗi bảo mật: Bạn không có quyền Admin!");
        }
    });
};

module.exports = { verifyToken, verifyAdmin };