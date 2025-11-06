const { Schema, model } = require('mongoose');

const NoticeSchema = new Schema(
  {
    title: { type: String, required: true },
    date: { type: String, default: () => new Date().toDateString() },
    description: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = model('Notice', NoticeSchema);


