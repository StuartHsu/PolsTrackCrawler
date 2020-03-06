const request = require('request');
const cheerio = require('cheerio');
const asyncModule = require('async');
const errorLog = require('../../util/errorRecord.js');

module.exports =
{
  get: function()
  {
    return new Promise(async function(resolve, reject)
    {
      //  來源 URL
      const fetchUrl = 'https://www.cna.com.tw/list/aipl.aspx';

      await getUrls(fetchUrl, async (err, results) =>
      {
        await asyncModule.map(results, getInfo, (err, results) =>
        {
          resolve(results);
        });
      });
    });
  }
}

// 取得政治分類的細項連結
function getUrls(url, cb)
{
  return new Promise(function(resolve, reject)
  {
    request(url, function(err, resp, body)
    {
      if (err)
      {
        errorLog.errorMessage("cna getUrls error");
      }
      else
      {
        const $ = cheerio.load(body);
        const urls = [];
        const urlParent = $('#myMainList li a');
        let url = '';

        for (let i = 0; i < urlParent.length; i++)
        {
          url = $('#myMainList li a').eq(i).attr('href');
          urls.push(url);
        }

        cb(null, urls);
      }
    });
  });
};

// 取得各新聞詳細內容
function getInfo(url, cb)
{
  return new Promise(function(resolve, reject)
  {
    request(url, function(err, res, body)
    {
      if (err)
      {
        errorLog.errorMessage("cna getInfo error");
      }
      else
      {
        const $ = cheerio.load(body);
        const title = $('.centralContent h1').text().trim();
        let content = '';

        for (let i = 0; i < $('.centralContent .paragraph p').length; i++)
        {
          content += $('.centralContent .paragraph p').eq(i).text().trim();
        }
        // 濾除 XX記者/XX報導 開頭字樣
        let strPos;

        if (content.indexOf('電）') > 1)
        {
          strPos = content.indexOf('電）') + 2;
        }
        else
        {
          strPos = content.indexOf('日）') + 2;
        }

        content = content.substring(strPos, content.length);
        const desc = content.substr(0, 150) + '...';
        const href = url;
        const pubTime = $('.centralContent .updatetime span').text().trim();

        cb(null, {title, desc, content, href, pubTime});
      }
    });
  });
};
