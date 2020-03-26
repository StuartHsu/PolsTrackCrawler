const request = require('request');
const qs = require('querystring');
const errorLog = require('../../util/errorRecord.js');

module.exports = {
  get: function(args) {
    const host = 'https://api.ftvnews.com.tw';
    const url = urlWithEndpoint('/api/FtvGetNews', args, host);
    let body = {};
    const data = [];

    return new Promise(function(resolve, reject) {
      request({url: url, method: 'GET'}, function(err, resp, results) {
        if (err || !body) {
          errorLog.errorMessage('ftv get request error');
        } else {
          const parseResult = JSON.parse(results).ITEM;

          if (!parseResult) {
            resolve(data);
          } else {
            for (let i = 0; i < parseResult.length; i++) {
              body =
              {
                title: parseResult[i].Title,
                desc: parseResult[i].Preface.replace( /(<([^>]+)>)/ig, ''),
                content: parseResult[i].Content.replace( /(<([^>]+)>)/ig, ''),
                href: parseResult[i].WebLink,
                pubTime: parseResult[i].CreateDate.substr(0, 16)
              };

              data.push(body);
            }
            resolve(data);
          }
        }
      });
    });
  }
};


function urlWithEndpoint(endpoint, params, host) {
  const query = qs.stringify(params);
  const baseURL = `${host}${endpoint}`;

  return query ? `${baseURL}?${query}` : baseURL;
}
