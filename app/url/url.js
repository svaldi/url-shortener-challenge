const uuidv4 = require('uuid/v4');
const { domain } = require('../../environment');
const SERVER = `${domain.protocol}://${domain.host}`;

const UrlModel = require('./schema');
const parseUrl = require('url').parse;
const validUrl = require('valid-url');

/**
 * Lookup for ALL, active shortened URLs.
 * 'null' will be returned when no matches were found.
 * @returns {array}
 */
async function getURLS() {
  let data = await UrlModel.find({ active: true });
  return data;
}

/**
 * Lookup for existant, active shortened URLs by hash.
 * 'null' will be returned when no matches were found.
 * @param {string} hash
 * @returns {object}
 */
async function getUrl(hash) {
  let source = await UrlModel.findOne({ active: true, hash });
  return source;
}

/**
 * Generate a random token that will allow URLs to be (logical) removed
 * @returns {string} uuid v4
 */
function generateRemoveToken() {
  return uuidv4();
}

/**
 * Create an instance of a shortened URL in the DB.
 * Parse the URL destructuring into base components (Protocol, Host, Path).
 * An Error will be thrown if the URL is not valid or saving fails.
 * @param {string} url
 * @param {string} hash
 * @returns {object}
 */
async function shorten(url) {

  if (!isValid(url)) {
    throw new Error('Invalid URL');
  }

  // Get URL components for metrics sake
  const urlComponents = parseUrl(url);
  const protocol = urlComponents.protocol || '';
  const domain = `${urlComponents.host || ''}${urlComponents.auth || ''}`;
  const path = `${urlComponents.path || ''}${urlComponents.hash || ''}`;

  // Generate a token that will alow an URL to be removed (logical)
  const removeToken = generateRemoveToken();

  // Create a new model instance
  const shortUrl = new UrlModel({
    url,
    protocol,
    domain,
    path,
    isCustom: false,
    removeToken,
    active: true
  });

  const saved = await shortUrl.save();
  // TODO: Handle save errors

  return {
    url,
    shorten: `${SERVER}/${saved.hash}`,
    hash: saved.hash,
    removeUrl: `${SERVER}/${saved.hash}/remove/${removeToken}`
  };

}

/**
 * Validate URI
 * @param {any} url
 * @returns {boolean}
 */
function isValid(url) {
  return validUrl.isUri(url);
}

module.exports = {
  shorten,
  getURLS,
  getUrl,
  generateRemoveToken,
  isValid
}
