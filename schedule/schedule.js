var schedule = require('node-schedule');

// // 可以按照 cron 的格式設定
// function runSchedule (cb) {
//   // cron 風格的配置：每 5 分鐘執行一次
//   schedule.scheduleJob('0 17 */3 * * *', function () {
//     // console.log('定時任務執行一次');
//     console.log("scheduleCronstyle:" + new Date());
//     cb && cb();
//   });
// }

// module.exports = runSchedule;

module.exports = {
  crawler: function(cb) {
    // cron 風格的配置：
    schedule.scheduleJob('0 17 */3 * * *', function () {
    // schedule.scheduleJob('45 51 * * * *', function () {
      // console.log('定時任務執行一次');
      console.log("newCrawlerExecTime:" + new Date());
      cb && cb();
    });
  },
  tag: function(cb) {
    // cron 風格的配置：
    // schedule.scheduleJob('0 17 */3 * * *', function () {
    schedule.scheduleJob('0 3 * * * *', function () {
      // console.log('定時任務執行一次');
      console.log("新聞標籤更新:" + new Date());
      cb && cb();
    });
  }
}
