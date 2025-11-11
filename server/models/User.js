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
    // track per-user actions for notices
    upvotedNotices: [{ type: Schema.Types.ObjectId, ref: 'Notice' }],
    readNotices: [{ type: Schema.Types.ObjectId, ref: 'Notice' }],
  },
  { timestamps: true }
);

module.exports = model('User', UserSchema);


