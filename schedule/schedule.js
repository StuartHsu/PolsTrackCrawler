var schedule = require('node-schedule');

module.exports =
{
  crawler: function(cb)
  {
    // cron 風格的配置：
    schedule.scheduleJob('0 20 */3 * * *', function ()
    {
      console.log("newCrawlerExecTime:" + new Date());

      cb && cb();
    });
  },
  tag: function(cb)
  {
    schedule.scheduleJob('0 35 * * * *', function ()
    {
      console.log("新聞標籤更新:" + new Date());

      cb && cb();
    });
  }
}
