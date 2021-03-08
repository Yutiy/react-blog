const jwt = require('jsonwebtoken')

module.exports = (app) => {
  const { jwtSecret } = app.config;

  return {
    /**
     * @param {Object} info - 存储在token中的值
     */
    createToken(info) {
      return jwt.sign(info, jwtSecret, { expiresIn: '720h' })
    },
    /**
     * @param {Object} ctx - app.context
     * @param {Array} roleList - 需要具备的权限 { role: 1, verifyTokenBy: 'url' }
     *
     * @return {Boolean} 是否验证通过
     */
    checkToken: (ctx, roleList: Array<{ role: number, verifyTokenBy: string }> = []) => {
      let isVerify = false
      const { query, headers } = ctx;
      function _verify(token) {
        return jwt.verify(token, jwtSecret, function(err, decoded) {
          if (err) {
            return false
          } else if (decoded) {
            return !!roleList.find(item => item.role === decoded.role)
          }
          return false
        })
      }

      for (const item of roleList) {
        if (item.verifyTokenBy === 'headers') {
          const authorizationHeader = headers.authorization
          if (authorizationHeader) {
            const token = authorizationHeader.split(' ')[1] // 取到 token
            const result = _verify(token)
            if (result) {
              isVerify = true
              break
            }
          }
        } else {
          const { token } = query
          if (token) {
            const _token = token.split(' ')[1] // 取到 token 过滤 Bearer
            const result = _verify(_token)
            if (result) {
              isVerify = true
              break
            }
          }
        }
      }

      return isVerify
    },
  }
}
