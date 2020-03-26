const promiseSql = require('../../util/promiseSql.js');
const nodejieba = require('nodejieba');
const errorLog = require('../../util/errorRecord.js');

nodejieba.load({userDict: './util/dict.txt'});

module.exports = {
  getTag: async function(start, end) {
    try {
      const sql = 'SELECT id, content FROM news WHERE pubTime > ? AND pubTime < ?;';
      const news = await promiseSql.query(sql, [start, end]);
      const totalCount = news.length;

      for (let j = 0; j < totalCount; j++) {
        console.log('處理中：' + j + '/' + totalCount + ', news_id：' + news[j].id);
        const jieba = nodejieba.tag(news[j].content);

        for (let i = 0; i < jieba.length; i++) {
          if (jieba[i].tag === 'NRP' || jieba[i].tag === 'NI') {
            const tagId = await getTagId(jieba[i].word);
            const data =
            {
              news_id: news[j].id,
              tag_id: tagId
            };
            const checkResult = await checkNewsId(data);

            await saveTagInfo(data, checkResult);
          }
        }
      }
      console.log('處理完成');
      return ('All tags update!');
    } catch (error) {
      errorLog.errorMessage('NewsGetTag error: ' + error);
      return error;
    }
  }
};


async function getTagId(tagName) {
  try {
    const data = await promiseSql.query('SELECT parent_id FROM filtercount WHERE name = ?', tagName);

    if (data.length > 0) {
      return data[0].parent_id;
    } else {
      return;
    }
  } catch (error) {
    errorLog.errorMessage('GetTagId error: ' + error);
    return error;
  }
}

async function checkNewsId(data) {
  try {
    const results = await promiseSql.query('SELECT * FROM newstag WHERE news_id = ? AND tag_id = ?;', [data.news_id, data.tag_id]);

    return results;
  } catch (error) {
    errorLog.errorMessage('checkNewsId error: ' + error);
    return error;
  }
}

async function saveTagInfo(data, checkResult) {
  try {
    if (checkResult.length < 1) {
      await promiseSql.query('INSERT newstag SET ?;', [data]);

      return ('Insert Ok');
    } else {
      await promiseSql.query('UPDATE newstag SET ? WHERE news_id = ? AND tag_id = ?;', [data, data.news_id, data.tag_id]);

      return ('Update ok');
    }
  } catch (error) {
    errorLog.errorMessage('saveTagInfo error: ' + error);
    return error;
  }
}
