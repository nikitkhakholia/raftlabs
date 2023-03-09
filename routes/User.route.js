const express = require("express");
const { getUserById, signUp, signIn, getUser, getUsers, updateUser, deleteUser } = require("../controllers/user.controller");
const { isSignedIn, isAuthenticated, checkUserRole } = require("../services/User.service");
const router = express.Router();

router.param("userId", getUserById);

router.post("/register", (req, res, next) => {
    if (!req.body.fname) return res.status(400).json({ status: 0, error: "First Name is required." })
    if (!req.body.email) return res.status(400).json({ status: 0, error: "Email is required." })
    if (!req.body.password || req.body.password.length < 8) return res.status(400).json({ status: 0, error: "Password must be 8 chars long." })
    next()

}, signUp);
router.post("/login", (req, res, next) => {
    if (!req.body.email) return res.status(400).json({ status: 0, error: "Email is required." })
    if (!req.body.password || req.body.password.length < 8) return res.status(400).json({ status: 0, error: "Password must be 8 chars long." })
    next()
}, signIn);
router.get("/user/:userId", isSignedIn, isAuthenticated, getUser);
router.get("/users/:userId", isSignedIn, isAuthenticated, checkUserRole("ADMIN"), getUsers);
router.put("/user/:userId", isSignedIn, isAuthenticated, updateUser);
router.delete("/user/:userId", isSignedIn, isAuthenticated, checkUserRole("ADMIN"), deleteUser);
router.get("/clearCache", (req, res) => {
    CacheClient.flushdb();
    console.log("cacheCleaned");
    res.json();
});
module.exports = router;