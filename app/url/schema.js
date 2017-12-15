const crypto = require('crypto');
const mongo = require('../../server/mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var UrlSchema = new Schema({
  url: {
    type: String,
    required: true
  },

  user: mongoose.Schema.Types.ObjectId,

  hash: {
    type: String,
    unique: true
  },
  isCustom: {
    type: Boolean,
    required: true
  },

  removeToken: {
    type: String,
    required: true
  },

  protocol: String,
  domain: String,
  path: String,

  createdAt: {
    type: Date,
    default: Date.now
  },
  removedAt: Date,

  active: {
    type: Boolean,
    required: true,
    default: true
  }
});

/**
 * Pre-save hook
 */
UrlSchema
  .pre('save', function(next) {
    // Make hash with a callback
    this.makeHash(3, (hashErr, hash) => {
      if(hashErr) {
        return next(hashErr);
      }
      this.hash = hash;
      return next();
    });
  });

/**
 * Methods
 */
UrlSchema.methods = {
  /**
   * Make hash
   *
   * @param {Number} [byteSize] - hash byte size
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeHash(byteSize, callback) {
    return crypto.randomBytes(byteSize, (err, buffer) => {
      if(err) {
        return callback(err);
      } else {
        return callback(null, buffer.toString('hex'));
      }
    });
  }
};

module.exports = mongo.model('Url', UrlSchema);
