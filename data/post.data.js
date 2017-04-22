const util = require('../util')()
const fsUtil = util.fsUtil
const compressionUtil = util.compressionUtil
const metadataUtil = util.metadataUtil

module.exports = (models) => {
  const Post = models.postModel
  return {
    savePicture (newPicture, fileData) {
      const fileThreePath = fsUtil.generateFileTreePath()
      const fileName = fsUtil.generateFileName('jpg')
      const storagePath = fsUtil.getStoragePath()

      const thumbnailFileName = fsUtil.joinDirectory(storagePath, fileThreePath, `small_${fileName}`)
      const pictureFileName = fsUtil.joinDirectory(storagePath, fileThreePath, `big_${fileName}`)

      return compressionUtil.makePictureAndThumbnail(newPicture).then((data) => {
        let writeBig = fsUtil.writeFileToDisk(pictureFileName, data[0])
        let writeSmall = fsUtil.writeFileToDisk(thumbnailFileName, data[1])

        return Promise.all([writeBig, writeSmall]).then(() => {
          const metadata = metadataUtil.extractMetadata(newPicture)
          const isGenuine = metadataUtil.isGenuineDronePicture(metadata)

          let picToSave = {
            uploaderUsername: fileData.uploaderUsername,
            directory: fileThreePath,
            fileName: fileName,
            tags: fileData.tags,
            caption: fileData.caption,
            droneTaken: fileData.droneTaken,
            isGenuine: isGenuine,
            metadata: metadata
          }

          return Post.create(picToSave)
        })
      })
    },
    saveComment (pictureId, comment) {
      /* addtoset or push??? */
      return Post.findByIdAndUpdate(pictureId, {$addToSet: {comments: comment}})
    },
    saveLike (pictureId, userId) {
      return Post.findByIdAndUpdate(pictureId, {$addToSet: {likes: userId}})
    },
    removeLike (pictureId, userId) {
      return Post.findByIdAndUpdate(pictureId, {$pull: {likes: userId}})
    },
    getPictureById (pictureId, selector) {
      return Post.findById(pictureId).select(selector)
    },
    getPostsByUsername (username, time, selector) {
      return Post.find({
        uploaderUsername: username,
        createdAt: {$lt: time}
      }).limit(3).sort('-createdAt').select(selector)
    },
    getExplorePosts (time, selector) {
      return Post.find({createdAt: {$lt: time}}).limit(3).sort('-createdAt').select(selector)
    },
    getPicturesCountByUsername (username) {
      return Post.where('uploaderUsername', username).count()
    }
  }
}