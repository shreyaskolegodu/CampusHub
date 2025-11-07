const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    sid: { type: String, default: null, index: true },
    // Optional profile fields
    bio: { type: String, default: '' },
    semester: { type: String, default: '' },
    srn: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = model('User', UserSchema);


