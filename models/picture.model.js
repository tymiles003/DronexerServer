const mongoose = require('mongoose')
const timestamps = require('mongoose-timestamp')

const PictureSchema = mongoose.Schema({
  uploaderUsername: {
    type: String,
    required: true,
    index: true
  },
  directory: {
    type: String,
    required: true/*,
     index: { unique: true, dropDups: true } */
  },
  fileName: {
    type: String,
    required: true
  },
  caption: {
    type: String
  },
  droneTaken: {
    type: String
  },
  isGenuine: {
    type: Boolean
  },
  comments: [{
    userId: mongoose.SchemaTypes.ObjectId,
    comment: String
  }],
  tags: {
    type: [String],
    index: true
  },
  likes: {
    type: [mongoose.SchemaTypes.ObjectId]
  },
  metadata: {
    lat: {
      type: String
    },
    lng: {
      type: String
    },
    alt: {
      type: String
    },
    make: {
      type: String
    },
    model: {
      type: String
    },
    dateTaken: {
      type: String
    }
  }
})

PictureSchema.plugin(timestamps, {
  createdAt: {
    name: 'createdAt',
    type: Date,
    index: true
  },
  updatedAt: {
    name: 'updatedAt',
    type: Date,
    index: true
  }
})

mongoose.model('Picture', PictureSchema)

module.exports = () => {
  return mongoose.model('Picture')
}
