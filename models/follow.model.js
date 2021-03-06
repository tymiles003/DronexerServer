const mongoose = require('mongoose')
const shortid = require('shortid')

const FollowSchema = mongoose.Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  followerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  followeeId: {
    type: String,
    required: true,
    ref: 'User'
  }
}, { timestamps: true })

FollowSchema.index({ followerId: 1, followeeId: 1 }, { unique: true })

module.exports = mongoose.model('Follow', FollowSchema)
