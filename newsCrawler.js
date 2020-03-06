const express = require('express');
const bodyParser = require('body-parser');
const db = require('./model/savenews');
const runSchedule = require('./schedule/schedule.js');
const fs = require("fs");

const PORT = process.env.PORT || 3001;

const crawler =
{
  ftv: require('./model/newsSource/ftv'),
  ebc: require('./model/newsSource/ebc'),
  ett: require('./model/newsSource/ett'),
  cna: require('./model/newsSource/cna'),
  tvbs: require('./model/newsSource/tvbs')
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

app.listen(3001, async ()=>
{
	console.log("Crawler listening");
  let count = 1;

	runSchedule.crawler(async function()
  {
    console.log("執行第 " + count + " 次。");

    const newsList =
    [
      crawler.ftv.get({Cate: 'POL', Page: 1, Sp: 200}),
      crawler.ebc.get(),
      crawler.ett.get(),
      crawler.cna.get(),
      crawler.tvbs.get()
    ];
    const name =
    [
      'ftv',
      'ebc',
      'ett',
      'cna',
      'tvbs'
    ]

    for (let i = 0; i < newsList.length; i++)
    {
      await newsList[i].then(async resp =>
        {
        if (resp.length > 0)
        {
          await dataForm(name[i], resp);

          console.log(name[i] + " done");
        }
        else
        {
          console.log(name[i] + ": can't get data from web.");
        }
      })
      .catch(err =>
      {
        console.log(name[i] + err);
      });
    }

    console.log("爬蟲執行完畢");
    count++;
	});
});


async function dataForm(publisher, resp)
{
  for (let i = 0; i < resp.length; i++)
  {
    const data =
    {
      title: resp[i].title,
      description: resp[i].desc,
      content: resp[i].content,
      href: resp[i].href,
      pubTime: resp[i].pubTime,
      publisher: publisher
    }
    // save news to db
    await db.save(data.title, data).catch(err =>
    {
      console.log(err);
    });
  }
}
