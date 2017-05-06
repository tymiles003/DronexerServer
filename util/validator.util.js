const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const fileType = require('file-type')
const validator = require('validator')

module.exports = function () {
  return {
    validateRegisterInput(data, isEditData) {
      if (!data.firstName) {
        return {
          isValid: false,
          msg: 'First Name is required.'
        }
      }
      if (data.firstName !== validator.escape(data.firstName)) {
        return {
          isValid: false,
          msg: 'First Name is invalid.'
        }
      }
      if (!data.lastName) {
        return {
          isValid: false,
          msg: 'Last Name is required.'
        }
      }
      if (data.lastName !== validator.escape(data.lastName)) {
        return {
          isValid: false,
          msg: 'Last Name is invalid.'
        }
      }
      if (!data.username) {
        return {
          isValid: false,
          msg: 'Username is required.'
        }
      }
      if (data.username !== validator.escape(data.username)) {
        return {
          isValid: false,
          msg: 'Username is invalid.'
        }
      }
      if (data.username.length < 4) {
        return {
          isValid: false,
          msg: 'Username too short.'
        }
      }
      if (!data.email) {
        return {
          isValid: false,
          msg: 'Email is required.'
        }
      }
      if (!emailRegex.test(data.email)) {
        return {
          isValid: false,
          msg: 'Email is invalid.'
        }
      }
      if (!isEditData) {
        if (!data.password) {
          return {
            isValid: false,
            msg: 'Password is required.'
          }
        }
      }
      if (data.password) {
        if (data.password !== data.passwordConfirm) {
          return {
            isValid: false,
            msg: 'Passwords didn\'t match.'
          }
        }
        if (data.password.length < 6) {
          return {
            isValid: false,
            msg: 'Password too short.'
          }
        }
        if (data.password.length > 50) {
          return {
            isValid: false,
            msg: 'Password too long.'
          }
        }
      }
      return {
        isValid: true,
        msg: ''
      }
    },
    validateProfilePicture(profilePicture){
      const realFileType = fileType(profilePicture.buffer)
      if (realFileType.mime !== 'image/jpeg' && realFileType.mime !== 'image/jpg' && realFileType.mime !== 'image/png') {
        return {
          isValid: false,
          msg: 'Unaccepted file type.'
        }
      }
      return {
        isValid: true,
        msg: ''
      }
    },
    validator,
  }
}