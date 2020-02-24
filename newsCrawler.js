const express = require('express');
const bodyParser = require('body-parser');
const mysql = require("./util/mysqlcon.js");
const db = require('./model/savenews');
const request = require('request');
const cheerio = require('cheerio');
const runSchedule = require('./crawler/schedule.js');

const PORT = process.env.PORT || 3001;

const crawler = {
  ftv: require('./crawler/ftv'),
  ebc: require('./crawler/ebc'),
  ett: require('./crawler/ett'),
  cna: require('./crawler/cna'),
  tvbs: require('./crawler/tvbs')
}

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something Error!');
});

// app.listen(3001, () => {
//   console.log(`Server running on port ${PORT}`);
// });

app.listen(3001, async ()=>{
	console.log("Crawler listening");
  let count = 1;

	runSchedule(async function() {
    console.log("執行第 " + count + " 次。");

    let newsList = [
      crawler.ftv.get({Cate: 'POL', Page: 1, Sp: 200}),
      crawler.ebc.get(),
      crawler.ett.get(),
      crawler.cna.get(),
      crawler.tvbs.get()
    ];
    let name = [
      'ftv',
      'ebc',
      'ett',
      'cna',
      'tvbs'
    ]
    for(let i = 0; i < newsList.length; i++) {
      await newsList[i].then(async resp => {
        if(resp.length > 0) {
          await dataForm(name[i], resp);
          console.log(name[i] + " done");
        } else {
          console.log(name[i] + ": can't get data from web.");
        }
      }).catch(err => {
        console.log(name[i] + ": database query error.");
      });
    }
    count++;
	});

});


async function dataForm(publisher, resp) {
  for (let i = 0; i < resp.length; i++) {
    let data = {
      title: resp[i].title,
      description: resp[i].desc,
      content: resp[i].content,
      href: resp[i].href,
      pubTime: resp[i].pubTime,
      publisher: publisher
    }
    // save news to db
    await db.save(data.title, data).then(async function(results) {
      // nothing to do when insert data ok...
    }).catch(err => {
      console.log(err);
    });
  }
}
