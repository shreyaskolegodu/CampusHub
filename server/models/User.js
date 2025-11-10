const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String },
    srn: { type: String },
    semester: { type: String },
    avatarUrl: { type: String },
    passwordHash: { type: String, required: true },
    sid: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = model('User', UserSchema);


