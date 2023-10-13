const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Please Provide An Email 😑"],
      unique: [true, "Email Exist 😑"],
    },
    firstname: {
      type: String,
      required: [true, "Please Provide First Name 😑"],
      unique: false,
    },
    lastname: {
      type: String,
      required: [true, "Please Provide Last Name 😑"],
      unique: false,
    },
    password: {
      type: String,
      required: [true, "Please Provide A Password 😑"],
      unique: false,
      minLength: 8,
    },
    created_on:{
      type: Date,
    },
    confirmed:{
      type: String,
      default: "0",
    },
    reset_password_token:{
      type:String,
    },
    token: {
      type: String,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
