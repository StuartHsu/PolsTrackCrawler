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
      const fetchUrl = 'https://news.tvbs.com.tw/politics/';

      await getUrls(fetchUrl, async (err, result) =>
      {
        if (result.length > 40)
        {
          result = result.splice(39, result.length - 40)
        }
        await asyncModule.map(result, getInfo, (err, results) =>
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
        errorLog.errorMessage("tvbs getUrls error");
      }
      else
      {
        const $ = cheerio.load(body);
        const urls = [];
        const urlParent = $('#block_768 .content_center_list_box a');
        let url = '';

        for (let i = 0; i < urlParent.length; i++) // urlParent.length
        {
          url = 'https://news.tvbs.com.tw' + urlParent.eq(i).attr('href');
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
    request(url, async function(err, res, body)
    {
      if (err)
      {
        errorLog.errorMessage("tvbs getInfo error");
      }
      else
      {
        if (body)
        {
          const $ = cheerio.load(body);
          const title = $('.newsdetail_content .title.margin_b20 h1').text().trim();
          const content = $('#news_detail_div').clone().find('strong').remove().end().text().trim();
          const desc = content.substr(0, 150) + '...';
          const href = url;
          const pubTime = $('.newsdetail_content .icon_time.time.leftBox2').text().trim();

          cb(null, {title, desc, content, href, pubTime});
        }
        else
        {
          cb(null, null);
        }
      }
    });
  });
};
