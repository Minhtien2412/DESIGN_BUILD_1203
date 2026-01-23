/**
 * Jest Mock for React Native Platform
 */
module.exports = {
  OS: "ios",
  Version: 17,
  isPad: false,
  isTV: false,
  isTesting: true,
  select: function (obj) {
    if (obj.ios !== undefined) return obj.ios;
    if (obj.native !== undefined) return obj.native;
    return obj.default;
  },
};
