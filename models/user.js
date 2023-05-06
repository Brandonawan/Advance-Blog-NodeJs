const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    }
  });

module.exports = model("User", userSchema);