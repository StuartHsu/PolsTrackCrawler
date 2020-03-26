const mysql = require('../../util/mysqlcon.js');
const promiseSql = require('../../util/promiseSql.js');
const nodejieba = require('nodejieba');
const fs = require('fs');
const errorLog = require('../../util/errorRecord.js');

nodejieba.load({userDict: './util/dict.txt'});

module.exports = {
  segmentation: async function(start, end) {
    try {
      const sql = 'SELECT content FROM news WHERE pubTime > ? AND pubTime < ?;';
      const results = await promiseSql.query(sql, [start, end]);
      const totalCount = results.length;

      for (let j = 0; j < totalCount; j++) {
        console.log('處理中：' + j + '/' + totalCount);
        const jieba = nodejieba.tag(results[j].content);
        for (let i = 0; i < jieba.length; i++) {
          if (jieba[i].tag === 'N') {
            const data =
            {
              name: jieba[i].word,
              type: jieba[i].tag,
              count: 1
            };
            await saveSegmentationResult(data);
          }
        }
      }
      console.log('斷詞處理完成');

      return ('Segmentation done');
    } catch (error) {
      errorLog.errorMessage('Segmentation error: ' + error);
      return error;
    }
  },
  getPendingTags: async function() {
    const sql = `SELECT * FROM tagverify WHERE status is null AND count > ? ORDER BY count DESC;`;
    const count = 20;

    try {
      const results = await promiseSql.query(sql, count);
      const data = [];
      const totalCount = results.length;

      console.log('待處理標籤數量：' + totalCount);
      for (let i = 0; i < totalCount; i++) {
        const body =
        {
          tagName: results[i].name,
          count: results[i].count
        };
        data.push(body);
      }

      return data;
    } catch (error) {
      return error;
    }
  },
  updateDic: function(updateData) {
    for (let i = 0; i < updateData.length; i++) {
      if (updateData[i].inputTag) {
        const newTag = `${updateData[i].tagName} 1 ${updateData[i].inputTag}\n`;

        fs.appendFile('./util/dict.txt', newTag, (err) => {
          if (err) {
            errorLog.errorMessage('updateDic error: ' + err);
            return err;
          }

          return ('Update dict.txt ok');
        });
      } else {
        return ('No need to update');
      }
    }
  },
  updateDB: async function(updateData) {
    const newTag = {};

    for (let i = 0; i < updateData.length; i++) {
      newTag.name = updateData[i].tagName;

      if (updateData[i].inputTag) {
        newTag.type = updateData[i].inputTag;
        newTag.status = 'Done';
      } else {
        newTag.type = 'N';
        newTag.status = 'Unused';
      }

      await updateTagStatus(newTag);
    }
    return ('All tag status update ok');
  }
};

function saveSegmentationResult(data) {
  return new Promise(async function(resolve, reject) {
    mysql.con.getConnection(function(err, connection) {
      connection.beginTransaction(async function(error) {
        if (error) {
          errorLog.errorMessage('Transaction error: ' + error);
          reject('Transaction Error: ' + error);
        }

        try {
          const checkResult = await promiseSql.query('SELECT * FROM tagverify WHERE name = ?', data.name);

          if (checkResult.length < 1) {
            await promiseSql.query('INSERT into tagverify SET ?', data);
            await promiseSql.commit(connection);

            resolve();
          } else {
            await promiseSql.query('UPDATE tagverify SET count = count + 1 WHERE name = ?', data.name);
            await promiseSql.commit(connection);

            resolve();
          }
        } catch (error) {
          mysql.con.rollback(function() {
            connection.release();

            errorLog.errorMessage('Database Segmentation error: ' + error);
            reject('Database Segmentation Error: ' + error);
          });
        }
      });
    });
  });
}

async function updateTagStatus(newTag) {
  const sql = `UPDATE tagverify SET type = ?, status = ? WHERE name = ?;`;

  try {
    await promiseSql.query(sql, [newTag.type, newTag.status, newTag.name]);

    return;
  } catch (error) {
    errorLog.errorMessage('updateTagStatus error: ' + error);
    return error;
  }
}
