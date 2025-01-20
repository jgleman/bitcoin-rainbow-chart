const http = require("https");
const fs = require("fs");
require("dotenv").config();

const apiKey = process.env.API_KEY;

// Get arguments from the command line
const [symbol, startDate, endDate] = process.argv.slice(2);

if (!symbol || !startDate || !endDate) {
  console.error("Usage: node index.js <symbol> <start_date> <end_date>");
  process.exit(1);
}

// Construct the path dynamically
const path = [
  "/time_series",
  "?apikey=",
  encodeURIComponent(apiKey),
  "&interval=1day",
  `&symbol=${encodeURIComponent(symbol)}`,
  "&type=stock",
  "&format=JSON",
  `&start_date=${encodeURIComponent(startDate + " 00:00:00")}`,
  `&end_date=${encodeURIComponent(endDate + " 12:50:00")}`,
];

const options = {
  method: "GET",
  hostname: "api.twelvedata.com",
  port: null,
  path: path.join(""),
};

const req = http.request(options, function (res) {
  const chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    const body = Buffer.concat(chunks);

    // Create the output file name
    const fileName = `../rawdata/${symbol}-${startDate}-${endDate}.json`;

    // Write the response data to a file
    fs.writeFile(fileName, body.toString(), (err) => {
      if (err) {
        console.error(`Failed to write file: ${err.message}`);
      } else {
        console.log(`Response written to '${fileName}'`);
      }
    });
  });
});

req.on("error", function (err) {
  console.error(`Request error: ${err.message}`);
});

req.end();
