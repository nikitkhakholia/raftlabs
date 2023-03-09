const UserModel = require("../models/User.model");
var expressJwt = require("express-jwt");

exports.cacheUser = (id, req, next) => {
    UserModel.findOne({ _id: id })
        .select("-createdAt -updatedAt -__v")
        .exec((err, user) => {
            if (err || !user) {
                next(true);
            } else {
                CacheClient.set("user_" + user._id, JSON.stringify(user), (e) => {
                    next(false);
                });
            }
        });
};
exports.isSignedIn = expressJwt({
    secret: process.env.SECRET,
    algorithms: ["HS256"],
    requestProperty: "auth",
});
exports.isAuthenticated = (req, res, next) => {
    let checker = req.profile && req.auth && req.profile.salt == req.auth.salt;
    if (!checker) {
        return res.status(403).json({
            error: "ACCESS DENIED",
        });
    }
    next();
};
exports.checkUserRole = (role) => {
    return (req, res, next) => {
        if (req.profile.roles.indexOf(role) !== -1) {
            next();
        } else {
            return res.status(400).json({
                status: 0,
                error: `No access granted.`,
            });
        }
    };
};