/**
 * @interface ITokenService
 */
export class ITokenService {
  /**
   * @param {Object} payload
   * @returns {string}
   */
  generateAccessToken(payload) {
    throw new Error('Not implemented');
  }

  /**
   * @param {Object} payload
   * @returns {string}
   */
  generateRefreshToken(payload) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} token
   * @returns {Object}
   */
  verifyAccessToken(token) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} token
   * @returns {Object}
   */
  verifyRefreshToken(token) {
    throw new Error('Not implemented');
  }
}
