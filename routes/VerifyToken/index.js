const jwt = require("jsonwebtoken");
const { Session } = require("../../models/Session");

const verifyToken = async (req, res, next) => {
  const token = req.cookies.SESSION;

  if (!token) {
    return res.status(401).json({ error: "You are not authenticated!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token is not valid!" });
    }

    try {
      req.user = user;

      // Check if the session exists and is not revoked
      const session = await Session.findOne({ session: token });
      if (!session || session.revoked) {
        return res.status(401).json({ error: "Session revoked or expired!" });
      }

      const currentTime = new Date().getTime();

      // Check if the current time is greater than or equal to the session expiration time
      if (currentTime >= session.exp.getTime()) {
        return res.status(401).json({ error: "Session expired!" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to verify session" });
    }
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


module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
