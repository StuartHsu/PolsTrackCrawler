const mysql = require("../../util/mysqlcon.js");
const nodejieba = require('nodejieba');

nodejieba.load({userDict: './util/dict.txt'});

module.exports={
  getPeriodCount: function(start, end) {
    return new Promise(async function(resolve, reject) {
      await clearCount();
      let sql = 'SELECT content FROM news WHERE pubTime > ? AND pubTime < ?;';
      mysql.con.query(sql, [start, end], async function(error, result1, fields) {
        if(error) {
          reject(error);
        }
        let totalCount = result1.length
        for(let j = 0; j < totalCount; j++) {
          console.log("處理中：" + j + "/" + totalCount);
          let jieba = nodejieba.tag(result1[j].content);
          for(let i = 0; i < jieba.length; i++) {
            if(jieba[i].tag === "NRP" || jieba[i].tag === "NI") {
              let data = {
                name: jieba[i].word,
                type: jieba[i].tag,
                count: 1
              }
              await db(data).then(async function(result){
                await db2(data, result);
              });
            }
          }
        }
        console.log("處理完成");
        resolve("All tags update!");
      });
    });
  },
  getPeriodCountAll2: function(end) {
    return new Promise(async function(resolve, reject) {
      await clearCountAll();
      let sql = 'SELECT content FROM news WHERE pubTime < ?;';
      mysql.con.query(sql, end, async function(error, result1, fields) {
        if(error) {
          reject(error);
        }
        let totalCount = result1.length
        for(let j = 0; j < totalCount; j++) {
          console.log("處理中2：" + j + "/" + totalCount);
          let jieba = nodejieba.tag(result1[j].content);
          for(let i = 0; i < jieba.length; i++) {
            if(jieba[i].tag === "NRP" || jieba[i].tag === "NI") {
              let data = {
                name: jieba[i].word,
                type: jieba[i].tag,
                count: 1
              }
              await db3(data);
            }
          }
        }
        console.log("處理完成");
        resolve("All tags update!");
      });
    });
  }
}

function clearCount() {
  return new Promise(function(resolve, reject) {
    let sql = 'UPDATE filtercount SET count = 0;';
    mysql.con.query(sql, function(error, results, fields) {
      if(error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function db(data) {

  return new Promise(async function(resolve, reject) {

    mysql.con.query(`select * from filtercount where name = "${data.name}"`, async function(error, checkResult, fields) {
      if(error){
        reject("Database Insert Error");
      }
      resolve(checkResult);
    });
  });
}

function db2(data, checkResult) {

  return new Promise(async function(resolve, reject) {
    if(checkResult.length < 1) {
      mysql.con.query('insert into filtercount set ?', data, function(error, results, fields) {
        if(error){
          reject("Database Insert Error");
        }
        resolve("ok");
      });
    } else {
      let query = `update filtercount set count = count + 1 where name = "${data.name}"`;
      mysql.con.query(query, function(error, results, fields){
        if(error){
          reject("Database Query Error");
        }
        resolve("ok");
      });
    }
  });
}

function db3(data) {

  return new Promise(async function(resolve, reject) {

    mysql.con.query(`select * from filtercount where name = "${data.name}"`, async function(error, checkResult, fields) {
      if(error){
        reject("Database 'filtercount' Query Error");
      } else {
        if(checkResult.length < 1) {
          mysql.con.query('insert into filtercount set ?', data, function(error, results, fields) {
            if(error){
              reject("Database 'filtercount' Insert Error");
            }
            resolve("ok");
          });
        } else {
          let query = `update filtercount set count = count + 1 where name = "${data.name}"`;
          mysql.con.query(query, function(error, results, fields){
            if(error){
              reject("Database 'filtercount' Update Error");
            }
            resolve("ok");
          });
        }
      }
    });
  });
}

function clearCountAll() {
  return new Promise(function(resolve, reject) {
    let sql = 'UPDATE filtercountall SET count = 0;';
    mysql.con.query(sql, function(error, results, fields) {
      if(error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function dbAll(data) {

  return new Promise(async function(resolve, reject) {

    mysql.con.query(`select * from filtercountall where name = "${data.name}"`, async function(error, checkResult, fields) {
      if(error){
        reject("Database Insert Error");
      }
      console.log(checkResult);
      resolve(checkResult);
    });
  });
}

function db2All(data, checkResult) {

  return new Promise(async function(resolve, reject) {
    if(checkResult.length < 1) {
      mysql.con.query('insert into filtercountall set ?', data, function(error, results, fields) {
        if(error){
          reject("Database Insert Error");
        }
        resolve("ok");
      });
    } else {
      let query = `update filtercountall set count = count + 1 where name = "${data.name}"`;
      mysql.con.query(query, function(error, results, fields){
        if(error){
          reject("Database Query Error");
        }
        resolve("ok");
      });
    }
  });
}
