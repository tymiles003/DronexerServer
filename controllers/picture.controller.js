const fileType = require('file-type')
const util = require('../util')()
const fsUtil = util.fsUtil
const validatorUtil = util.validatorUtil

module.exports = function (data) {
  const pictureData = data.pictureData
  const userData = data.userData
  return {
    uploadPicture (req, res) {
      let file = req.file
      let fileData = req.body

      let realFileType = fileType(file.buffer)
      file.realFileType = realFileType

      if (realFileType.mime !== 'image/jpeg' && realFileType.mime !== 'image/jpg' && realFileType.mime !== 'image/png') {
        return res.json({
          success: false,
          msg: 'Unaccepted file type.'
        })
      }

      pictureData.savePicture(file, fileData).then((data) => {
        let dataToReturn = data.toObject()
        res.json({
          success: true,
          msg: 'Uploaded successfully.',
          data: dataToReturn
        })
      }).catch((err) => {
        console.log(err)
        return res.status(500).json({
          success: false,
          msg: 'Server error.',
          error: err
        })
      })
    },
    getPictureById (req, res) {
      const pictureId = req.params.pictureId
      const size = req.params.size

      if (size !== 'big' && size !== 'small') {
        return res.json({
          success: false,
          msg: 'Invalid size parameter.'
        })
      }

      pictureData.getPictureById(pictureId).then((data) => {
        if (data) {
          let fileDir = fsUtil.joinDirectory(fsUtil.getStoragePath(), data.directory, `${size}_${data.fileName}`)
          return res.sendFile(fileDir, {
            root: './'
          })
        }
        return res.status(404).json({
          success: false,
          msg: 'Picture not found.'
        })
      }).catch((error) => {
        return res.status(500).json({
          success: false,
          msg: 'Error finding picture by id.',
          err: error.message
        })
      })
    },
    getCommentsByPictureId(req, res){
      const pictureId = req.params.pictureId

      pictureData.getPictureById(pictureId, 'comments').then((retrievedComments) => {
        if (retrievedComments) {
          let retrievedData = retrievedComments.toObject()
          let comments = retrievedData.comments
          const commenterIds = comments.map((comment) => comment.userId)
          return userData.getUsernamesById(commenterIds).then((retrievedUsers) => {
            comments.forEach((comment) => {
              retrievedUsers.forEach((user) => {
                if (comment.userId.equals(user._id)) {
                  comment.username = user.username
                }
              })
            })
            return res.json({
              success: true,
              data: comments
            })
          })
        }
        return res.status(404).json({
          success: false,
          msg: 'Comments not found.'
        })
      }).catch((error) => {
        console.log(error)
        return res.status(500).json({
          success: false,
          msg: 'Error getting picture comments by id.',
          err: error
        })
      })
    },
    getPicturesByUsername (req, res) {
      const urlUsername = req.params.username
      const currentUser = req.user
      let queryLimits = req.query
      let limits = validatorUtil.getQueryLimits(queryLimits)

      pictureData.getPicturesByUsername(urlUsername, '', limits).then((retrievedData) => {
        if (retrievedData.length) {
          let dataToReturn = retrievedData.map(part => part.toObject())
          dataToReturn.forEach((post) => {
            if (currentUser)
              post.isLikedByCurrentUser = post.likes.some(likeId => likeId.equals(currentUser._id))
            /* TODO Do this with separate count queries. */
            post.commentsCount = post.comments.length
            post.likesCount = post.likes.length
            delete post.comments
            delete post.likes
          })
          return res.json({
            success: true,
            msg: `Successfully retrieved ${dataToReturn.length} items.`,
            data: dataToReturn
          })
        }
        return res.status(404).json({
          success: false,
          msg: `This user has no pictures.`
        })
      }).catch((err) => {
        console.log(err)
        return res.status(500).json({
          success: false,
          msg: 'Error getting pictures by username.',
          error: err
        })
      })
    },
    getExplorePictures (req, res) {
      let before = req.query['before']
      const currentUser = req.user
      let parsedTime = new Date(Number(before))
      if (isNaN(parsedTime.valueOf())) {
        res.status(400).json({
          success: false,
          msg: "Bad parameter."
        })
      }
      pictureData.getExplorePictures(parsedTime).then(retrievedData => {
        if (retrievedData.length) {
          let dataToReturn = retrievedData.map(part => part.toObject())
          dataToReturn.forEach((post) => {
            if (currentUser)
              post.isLikedByCurrentUser = post.likes.some(likeId => likeId.equals(currentUser._id))
            /* TODO Do this with separate count queries. */
            post.commentsCount = post.comments.length
            post.likesCount = post.likes.length
            delete post.comments
            delete post.likes
          })
          return res.json({
            success: true,
            msg: `Successfully retrieved ${dataToReturn.length} items.`,
            data: dataToReturn
          })
        }
        return res.status(404).json({
          success: false,
          msg: `No pictures.`
        })
      }).catch((err) => {
        console.log(err)
        return res.status(500).json({
          success: false,
          msg: 'Error getting pictures by username.',
          error: err
        })
      })
    },
    commentPictureById (req, res) {
      const comment = req.body.comment
      const pictureId = req.params.pictureId
      const user = req.user
      /* TODO add validations and verifications and script escaping */
      const objToSave = {
        userId: user._id,
        comment: comment
      }
      pictureData.saveComment(pictureId, objToSave).then((data) => {
        if (data) {
          return res.json({
            success: true,
            msg: 'Commented successfully.'
          })
        }
      }).catch((err) => {
        return res.status(500).json({
          success: false,
          msg: 'Error commenting picture.',
          error: err
        })
      })
    },
    likePictureById (req, res) {
      const id = req.params.pictureId
      const user = req.user
      const userId = user._id

      pictureData.saveLike(id, userId).then(success => {
        res.json({
          success: true,
          msg: 'Liked successfully.'
        })
      }).catch(error => {
        res.status(500).json({
          success: false,
          msg: 'Error liking picture.',
          error: error
        })
      })
    },
    unLikePictureById (req, res) {
      const id = req.params.pictureId
      const user = req.user
      const userId = user._id

      pictureData.removeLike(id, userId).then(success => {
        res.json({
          success: true,
          msg: 'Uniked successfully.'
        })
      }).catch(error => {
        res.status(500).json({
          success: false,
          msg: 'Error unliking picture.',
          error: error
        })
      })
    }
  }
}
