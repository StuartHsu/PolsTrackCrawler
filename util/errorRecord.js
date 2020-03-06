const fs = require("fs");

module.exports =
{
  errorMessage: function(message)
  {
    let time = new Date();
    let errorMessage = `${time}：${message}\n`;
    
    fs.appendFileSync('./crawlerError.log', errorMessage);
  }
}
