const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.SESSION;

  if (!token) {
    return res.status(401).json({ error: "You are not authenticated!" });
  }

  jwt.verify(token, process.env.JWT_SEC, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token is not valid!" });
    }

    req.user = user;
    next();
  });
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    const { userId, role } = req.user;

    if (userId === req.params.userId || role === "admin") {
      next();
    } else {
      res.status(403).json({ error: "You are not allowed to do that" });
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    const { role } = req.user;

    if (role === "admin") {
      next();
    } else {
      res.status(403).json({ error: "You are not allowed to do that" });
    }
  });
};

const getUserId = (req, res, next) => {
  verifyToken(req, res, () => {
    const token = req.cookies.SESSION;

    jwt.verify(token, process.env.JWT_SEC, (err, decoded) => {
      if (err) {
        console.error(err);
        return res.status(403).json({ error: "Token is not correct" });
      }

      res.status(200).json(decoded);
    });
  });
};

module.exports = {
  getUserId,
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
