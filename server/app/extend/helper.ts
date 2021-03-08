const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');

const SALT_WORK_FACTOR = 10;
const key = CryptoJS.enc.Utf8.parse('1234567890000000'); // 16位
const iv = CryptoJS.enc.Utf8.parse('1234567890000000');

/**
 * 扩展helper
 */
export default {
  /**
 * @function encrypt - 加密
 * @param {String} password - 密码
 * @param {String} slat_factor - 加盐
 */
  encrypt(password: string, slat_factor: number = SALT_WORK_FACTOR) {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(slat_factor, (err, salt) => {
        if (err) reject(password)
        bcrypt.hash(password, salt, function(err, hash) {
          if (err) resolve(password)
          resolve(hash)
        })
      })
    })
  },
  /**
   * @function comparePassword - 密码校验
   * @param {String} _password - 需要校验的密码
   * @param {String} hash - 加密后的密码
   */
  comparePassword(_password: string, hash: string) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(_password, hash, function(err, isMatch) {
        if (err) reject(err)
        else resolve(isMatch)
      })
    })
  },

  // aes加密
  encryptAES(word: any) {
    let srcs: any = '';
    let encrypted: any = '';

    if (typeof word === 'string') {
      srcs = CryptoJS.enc.Utf8.parse(word);
    } else if (typeof word === 'object') { // 对象格式的转成json字符串
      const data = JSON.stringify(word);
      srcs = CryptoJS.enc.Utf8.parse(data);
    }

    encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.ciphertext.toString();
  },
  // aes解密
  decryptAES(word: any) {
    const encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    const decrypt = CryptoJS.AES.decrypt(srcs, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
  },

  // 字符串转对象，转换出错返回{}或者默认值
  JSONParse(str: string, defaultResult = {}) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return defaultResult || {};
    }
  },
  // 封装socket.io数据格式
  parseSocketMsg(action, payload = {}, metadata = {}) {
    return {
      meta: { timestamp: Date.now(), ...metadata },
      data: { action, payload },
    };
  },
};
