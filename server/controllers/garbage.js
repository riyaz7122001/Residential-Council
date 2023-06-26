const Garbage = require("../models/garbageModel");

exports.updateDate = async (req, res) => {
  const { date, id } = req.body;
  if (req.user.role === "admin") {
    try {
      const records = await Garbage.updateOne(
        { _id: id },
        { $set: { date: new Date(date) } }
      );
      res.status(200).json({ success: true, error: null });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
};

exports.getDate = async (req, res) => {
  try {
    const records = await Garbage.find({});
    res.status(200).json(records[0]);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
