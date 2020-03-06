const express = require('express');
const bodyParser = require('body-parser');
const runSchedule = require('./schedule/schedule.js');

const adminTag = require('./model/admin/adminTag');
const tagFreq = require('./model/admin/tagFreq');
const nlp = require('./model/admin/nlp');
const newsGetTag = require('./model/admin/newsGetTag');

const PORT = process.env.PORT || 3002;
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use((req, res, next) =>
{
  res.status(404).send("Sorry can't find that!");
});

app.use(function(err, req, res, next)
{
  console.error(err.stack);
  res.status(500).send('Server Has Something Error!');
});


app.listen(3002, async () =>
{
  console.log(`Server running on port ${PORT}`);

  runSchedule.tag(async function()
  {
    const today = dateForm(new Date()); // YYYY/MM/DD
    let period =
    {
      start: "",
      end: ""
    }

    // 1. 執行新聞斷詞
    period.start = startDayForm(today, 2) + " 00:00";
    period.end = today + " 23:59";

    await adminTag.seg(period.start, period.end)
    .catch(err =>
      {
        console.log("Seg err");
      });
    console.log("Seg DONE");

    // 4-2. Tag count refresh (DB: filterCount) All (for self check)
    // await tagFreq.getTagPeriodCount(null, today)
    // .catch(err =>
    //   {
    //     console.log("Tag count all err");
    //   });
    // console.log("Tag count all DONE");

    // 4-1. Tag count refresh (DB: filterCount)
    period.start = startDayForm(today, 14) + " 00:00";
    period.end = today + " 23:59";

    await tagFreq.getTagPeriodCount(period.start, period.end)
    .catch(err =>
      {
        console.log("Tag count 14 days err");
      });
    console.log("Tag count 14 days DONE");

    // 5. NLP training
    period.start = startDayForm(today, 2) + " 00:00";
    period.end = today + " 23:59";

    await nlp.train(period.start, period.end)
    .catch(err =>
      {
        console.log("NLP training err");
      });
    console.log("NLP training DONE");

    // 6. NLP process
    period.start = startDayForm(today, 2) + " 00:00";
    period.end = today + " 23:59";

    await nlp.process(period.start, period.end)
    .catch(err =>
      {
        console.log("NLP process err");
      });
    console.log("NLP process DONE");

    // 7. News get tag
    await newsGetTag.getTag(period.start, period.end)
    .catch(err =>
      {
        console.log("News get tag err");
      });
    console.log("News get tag DONE");

    console.log("ALL FINISHED!");
  });
});


function dateForm(date)
{
  const year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  month = month < 10 ? ('0' + month) : month;
  day = day < 10 ? ('0' + day) : day;

  return year + '/' + month + '/' + day;
}

function startDayForm(today, days)
{
  today = new Date(today);
  const startDay = new Date(today.setDate(today.getDate() - days));

  return dateForm(startDay);
}
