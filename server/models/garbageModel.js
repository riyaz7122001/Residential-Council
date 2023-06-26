const mongoose = require("mongoose");

// Garbage Collection Fields
// date

const garbageSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, "Please provide date"],
  },
});

const Garbage = new mongoose.model("garbage", garbageSchema);

module.exports = Garbage;
