// 立法院歷屆立委
const request = require('request');
const govLegislator = require('./crawler/gov/legislator');
govLegislator.get();

// 讀議員 excel
const readExcel = require('./model/news_source/gov/parliament');
readExcel.get();
