const UserModel = require("../models/User.model");
const UserService = require("../services/User.service");
const jwt = require("jsonwebtoken");

exports.getUserById = (req, res, next, id) => {
    CacheClient.get("user_" + id, (e, user) => {
        if (e || !user) {
            UserService.cacheUser(id, req, (err) => {
                if (err) {
                    return res.status(400).json({
                        status: 0,
                        error: "User not found.",
                    });
                } else {
                    CacheClient.get("user_" + id, (e, user) => {
                        req.profile = JSON.parse(user);
                        next();
                    });
                }
            });
        } else {
            req.profile = JSON.parse(user);
            next();
        }
    });
};

exports.signUp = async (req, res) => {
    const user = new UserModel(req.body);
    user.save().then((user) => {

        UserService.cacheUser(user._id, req, (err) => {
            if (!err) {
                const token = jwt.sign({ salt: user.salt }, process.env.SECRET, {});
                return res.json({
                    token,
                    email: user.email,
                    id: user._id
                });
            }
        });
    }).catch(err => {
            if (err.code === 11000) {
                return res.status(400).json({
                    status: 0,
                    error: `User Already Registered`,
                });
            } else {
                return res.status(400).json({
                    status: 0,
                    error: `${err.message}`,
                });
            }
    })

};
exports.updateUser = (req, res) => {
    delete req.body._id;
    if (req.profile.email) delete req.body.email;
    delete req.body.encryPassword;
    delete req.body.password;
    delete req.body.salt;
    delete req.body.roles;
    UserModel.findByIdAndUpdate(
        { _id: req.profile._id },
        { $set: req.body },
        { new: true, useFindAndModify: false },
        (err, user) => {
            if (err) {
                return res.status(400).json({
                    status: 0,
                    error: `${err.message}`,
                });
            }
            if (!user) {
                return res.status(400).json({
                    status: 0,
                    error: `User not found`,
                });
            }
            UserService.cacheUser(user._id, req, (err) => {
                if (!err) {
                    res.json({ status: 1 });
                }
            });
        }
    );
};
exports.signIn = (req, res) => {
    const { email, password } = req.body;
    if (!password) {
        return res.status(400).json({
            status: 0,
            error: `Invalid Request`,
        });
    }

    UserModel.findOne({ $or: [{ email }] }, (err, user) => {
        if (err) {
            return res.status(400).json({
                status: 0,
                error: `${err.message}`,
            });
        }
        if (!user) {
            return res.status(400).json({
                status: 0,
                error: `Please Register First.`,
            });
        }

        if (password) {
            if (!user.authenticate(password)) {
                return res.status(400).json({
                    status: 0,
                    error: `Please check your email or password.`,
                });
            }
        }

        const token = jwt.sign({ salt: user.salt }, process.env.SECRET, {});
        return res.json({
            token,
            email: user.email,
            id: user._id
        });
    });
};
exports.getUser = (req, res) => {
    delete req.profile.encryPassword
    delete req.profile.salt
    res.json({ status: 1, data: req.profile })
}
exports.getUsers = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 8;
    let sortBy = req.query.sortby ? req.query.sortby : "_id";
    let sortType = req.query.sorttype ? req.query.sorttype : "desc";
    let skip = req.query.skip ? parseInt(req.query.skip) : 0;
    UserModel.find().sort([[sortBy, sortType]])
        .limit(limit)
        .skip(skip)
        .select("-encryPassword -salt")
        .exec((err, users) => {
            if (err) {
                return res.status(400).json({
                    status: 0,
                    error: `${err.message}`,
                });
            } else {
                return res.json({
                    status: 1,
                    data: users,
                });
            }
        })
}
exports.deleteUser = (req, res) => {
    UserModel.deleteOne({ $or: [{ email: req.query.email }] }, (err) => {
        if (err) {
            return res.status(400).json({
                status: 0,
                error: err.message,
            });
        } else {
            return res.json({
                status: 1,
                error: `User Deleted.`,
            });
        }
    })
}