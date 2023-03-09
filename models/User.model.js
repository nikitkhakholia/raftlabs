var mongoose = require("mongoose");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

var userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    lname: {
      type: String,
      maxlength: 32,
      trim: true,
      default: "",
    },
    dob: {
      type: Date,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true
    },
    encryPassword: {
      type: String,
      required: true,
    },
    salt: String,
    roles: []
  },
  { timestamps: true }
);

userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv4();
    this.encryPassword = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  authenticate: function (plainpassword) {
    return this.securePassword(plainpassword) == this.encryPassword;
  },

  securePassword: function (plainpassword) {
    if (!plainpassword) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainpassword)
        .digest("hex");
    } catch (err) {
      console.error("SECURE PASSWORD EXCEPTION: " + `${err}`);
      return "";
    }
  },
};

module.exports = mongoose.model("User", userSchema);