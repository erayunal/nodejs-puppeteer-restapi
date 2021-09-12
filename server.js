const express = require("express");
const puppeteer = require("puppeteer");

const port = 8080;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/:container", async (req, res) => {
  const url =
    "https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html";

  const container = req.params.container;
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    await page.waitForSelector("button[id='accept-recommended-btn-handler']");
    await page.click("button[id='accept-recommended-btn-handler']");

    await page.waitForSelector('[id="tracing_by_container_f:hl12"]');
    await page.$eval(
      '[id="tracing_by_container_f:hl12"]',
      (el, value) => (el.value = value),
      container //"FANU1443334"
    );

    await page.$eval('[id="tracing_by_container_f:hl25"]', (el) => el.click());

    await page.waitForSelector(
      "[id='tracing_by_container_f:hl29'] .inputNonEdit"
    );

    const recordList = await page.$$eval(
      "[id='tracing_by_container_f:hl29'] .inputNonEdit",
      (trows) => {
        let rowList = [];
        console.log(JSON.stringify(trows));
        trows.forEach((row) => {
          //let record = {'name' : '','href' :''};
          //record.name = row.querySelector('td').innerText; // (tr < th < a) anchor tag text contains country name
          //record.href = row.querySelector('a.urunliste_ad').innerText; // (tr < th < a) anchor tag text contains country name
          console.log(row.toString());
          let label = row.parentNode.querySelector("label").innerText;
          let value = row.parentNode.querySelector("span").innerText;

          rowList.push({ label: label, value: value });
        });
        return rowList;
      }
    );

    res.json(recordList);

    await browser.close();
  } catch (error) {
    res.send(error.toString());
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
