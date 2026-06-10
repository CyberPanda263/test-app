import mongoose from "mongoose";

const testRecordSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("TestRecord", testRecordSchema);