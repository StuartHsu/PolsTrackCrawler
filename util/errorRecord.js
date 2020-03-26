const fs = require('fs');

module.exports = {
  errorMessage: function(message) {
    const time = new Date();
    const errorMessage = `${time}：${message}\n`;

    fs.appendFileSync('./crawlerError.log', errorMessage);
  }
};
