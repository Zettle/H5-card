const ua = navigator.userAgent.toLowerCase();
const utils = {
    isWeixin: ua.indexOf('micromessenger') != -1
};
module.exports = utils;