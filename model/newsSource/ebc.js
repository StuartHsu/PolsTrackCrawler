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
      const fetchUrl = 'https://news.ebc.net.tw/News/politics';

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
        errorLog.errorMessage("ebc getUrls error");
      }
      else
      {
        const $ = cheerio.load(body);
        const urls = [];
        const urlParent = $('.news-list-box .style1.white-box a');
        let url = '';

        for (let i = 0; i < urlParent.length; i++)
        {
          if ($('.news-list-box .style1.white-box a').eq(i).attr('href'))
          {
            url = 'https://news.ebc.net.tw' + $('.news-list-box .style1.white-box a').eq(i).attr('href');
            urls.push(url);
          }
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
        errorLog.errorMessage("ebc getInfo error");
      }
      else
      {
        const $ = cheerio.load(body);
        const title = $('.fncnews-content h1').text().trim();
        let content = '';

        for (let i = 0; i < $('.fncnews-content .raw-style p').length; i++)
        {
          content += $('.fncnews-content .raw-style p').eq(i).clone().find('strong').remove().end().text().trim();
        }

        const desc = content.substr(0, 150) + '...';
        const href = url;
        const reg = /[\u4e00-\u9fa5]/ig; // 中文字
        const pubTime = $('.fncnews-content .small-gray-text').text().replace(reg, '').trim();

        cb(null, {title, desc, content, href, pubTime});
      }
    });
  });
};
