const { Schema, model } = require('mongoose');

const ResourceSchema = new Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = model('Resource', ResourceSchema);


