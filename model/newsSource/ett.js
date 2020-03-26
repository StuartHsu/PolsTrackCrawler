const request = require('request');
const cheerio = require('cheerio');
const asyncModule = require('async');
const errorLog = require('../../util/errorRecord.js');

module.exports = {
  get: function() {
    return new Promise(async function(resolve, reject) {
      //  來源 URL
      const fetchUrl = 'https://www.ettoday.net/news/focus/%E6%94%BF%E6%B2%BB/';

      await getUrls(fetchUrl, async (err, results) => {
        await asyncModule.map(results, getInfo, (err, results) => {
          resolve(results);
        });
      });
    });
  }
};

// 取得政治分類的細項連結
function getUrls(url, cb) {
  return new Promise(function(resolve, reject) {
    request(url, function(err, resp, body) {
      if (err) {
        errorLog.errorMessage('ett getUrls error');
      } else {
        const $ = cheerio.load(body);
        const urls = [];
        const urlParent = $('.block_content .piece.clearfix a');
        let url = '';

        for (let i = 0; i < urlParent.length; i++) {
          if ($('.c1 .block_content .piece.clearfix a.pic').eq(i).attr('href')) {
            url = 'https://www.ettoday.net' + $('.c1 .block_content .piece.clearfix a.pic').eq(i).attr('href');
            urls.push(url);
          }
        }

        cb(null, urls);
      }
    });
  });
};

// 取得各新聞詳細內容
function getInfo(url, cb) {
  return new Promise(function(resolve, reject) {
    request(url, function(err, res, body) {
      if (err) {
        errorLog.errorMessage('ett getInfo error');
      } else {
        const $ = cheerio.load(body);
        const title = $('header h1.title').text().trim();
        let content = '';

        for (let i = 1; i < $('.story p').length; i++) {
          // 多處理照片註解被納入內文
          content += $('.story p').eq(i).clone().find('strong').remove().end().text().trim();
        }
        // 濾除 XX記者/XX報導 開頭字樣
        const strPos = content.indexOf('報導') + 2;
        content = content.substring(strPos, content.length);
        const desc = content.substr(0, 150) + '...';
        const href = url;
        const reg1 = /(['年'|'月'])/ig;
        const reg2 = /(['日'])/ig;
        const pubTime = $('.c1 time.date').text().trim().replace(reg1, '/').replace(reg2, '');

        cb(null, {title, desc, content, href, pubTime});
      }
    });
  });
};
