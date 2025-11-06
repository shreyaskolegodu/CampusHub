const { Schema, model } = require('mongoose');

const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String },
  },
  { timestamps: true }
);

module.exports = model('Post', PostSchema);


