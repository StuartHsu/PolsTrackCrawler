const mysql = require('../../util/mysqlcon.js');

const sheetNames = workbook.SheetNames; // 頁面陣列
const sheet = workbook.Sheets[sheetNames[4]]; // 取用頁面

module.exports = {
  get: function() {
    return new Promise(async function(resolve, reject) {
      const headers = {};
      const data = [];
      const keys = Object.keys(sheet);
      keys
          .filter((k) => k[0] !== '!') // 過濾以 ! 開頭的 key
          .forEach((k) => { // 遍歷所有單元格
            const col = k.substring(0, 1); // 如 A11 中的 A
            const row = parseInt(k.substring(1)); // 如 A11 中的 11
            const value = sheet[k].v; // 當前單元格的值
            // 儲存欄位名
            if (row === 1) {
              headers[col] = value;
              return;
            }
            // 解析成 JSON
            if (!data[row]) {
              data[row] = {};
            }
            data[row][headers[col]] = value;
          });

      const dataLength = data.length;

      for (let i = 2; i < dataLength; i++) {
        console.log('處理中：' + i + '/' + dataLength);
        await saveDB(data[i]);
      }

      console.log('處理完畢');
      resolve('Done');
    });
  }
};


async function saveDB(info) {
  return new Promise(function(resolve, reject) {
    mysql.con.query('SELECT * FROM politician WHERE name = ?;', info.name, function(error, results, fields) {
      if (error) {
        reject(error);
      }

      if (results.length < 1) {
        // save to db
        mysql.con.query('INSERT INTO politician SET ?', info, function(error, resp, fields) {
          if (error) {
            reject(error);
          } else {
            resolve('Finished saving to database');
          }
        });
      } else {
        // update db
        mysql.con.query('UPDATE politician SET ? WHERE name = ?', [info, info.name], function(error, resp, fields) {
          if (error) {
            reject(error);
          } else {
            resolve('Finished update database');
          }
        });
      }
    });
  });
}
