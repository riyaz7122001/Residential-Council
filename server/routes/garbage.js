const router = require("express").Router();

// Controllers
const { updateDate, getDate } = require("../controllers/garbage");

// AuthMiddleware
const authMiddleware = require("../middlewares/auth");

// Routes
router.post("/updateDate", authMiddleware, updateDate);
router.post("/getDate", authMiddleware, getDate);

module.exports = router;
