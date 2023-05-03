const { Schema, model } = require("mongoose");

const postSchema = new moongose.Schema({
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: { type: Date, default: Date.now }
  });