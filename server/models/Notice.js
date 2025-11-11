const { Schema, model } = require('mongoose');

const NoticeSchema = new Schema(
  {
    title: { type: String, required: true },
    date: { type: String, default: () => new Date().toDateString() },
    description: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    upvoteCount: { type: Number, default: 0 },
    // attachments could be paths/urls
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = model('Notice', NoticeSchema);


