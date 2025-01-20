const https = require("https");
const fs = require("fs");
require("dotenv").config();

// Get the symbol from the command line arguments
const [s] = process.argv.slice(2);
const symbol = s.toLowerCase() || undefined;

if (!symbol) {
  console.error("Usage: node index.js <symbol>");
  process.exit(1);
}

const apiKey = process.env.API_KEY;
const baseUrl = "https://api.twelvedata.com/time_series";

// Helper to format dates as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Function to fetch data from the API
function fetchData(symbol, startDate, endDate) {
  return new Promise((resolve, reject) => {
    const path = `${baseUrl}?apikey=${apiKey}&interval=1day&symbol=${encodeURIComponent(
      symbol
    )}&format=JSON&start_date=${encodeURIComponent(
      startDate + " 00:00:00"
    )}&end_date=${encodeURIComponent(endDate + " 12:50:00")}`;

    https
      .get(path, (res) => {
        const chunks = [];

        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString();
          try {
            resolve(JSON.parse(body));
          } catch (err) {
            reject(new Error("Failed to parse API response: " + err.message));
          }
        });
      })
      .on("error", (err) => reject(err));
  });
}

(async () => {
  const today = new Date();
  let endDate = formatDate(today);
  let startDate = formatDate(
    new Date(today.setFullYear(today.getFullYear() - 20))
  );

  let allValues = [];
  let hasMoreData = true;

  while (hasMoreData) {
    console.log(`Fetching data from ${startDate} to ${endDate}...`);
    try {
      const response = await fetchData(symbol, startDate, endDate);

      if (response.code === 429) {
        console.error(response.message);
        process.exit(1);
      }

      if (response.values && response.values.length > 0) {
        allValues = [...allValues, ...response.values];

        // Sort allValues by datetime in descending order and remove duplicates
        allValues = allValues.sort(
          (a, b) => new Date(b.datetime) - new Date(a.datetime)
        );
        allValues = Array.from(
          new Map(allValues.map((item) => [item.datetime, item])).values()
        );

        // Update endDate for the next iteration
        const earliestDate =
          response.values[response.values.length - 1].datetime;
        endDate = formatDate(
          new Date(
            new Date(earliestDate).setDate(new Date(earliestDate).getDate() - 1)
          )
        );
        startDate = formatDate(
          new Date(
            new Date(endDate).setFullYear(new Date(endDate).getFullYear() - 20)
          )
        );
      } else {
        hasMoreData = false; // No more data to fetch
      }
    } catch (err) {
      console.error("Error fetching data:", err.message);
      break;
    }
  }

  if (allValues.length === 0) {
    console.error("No Records Found!");
  } else {
    // Write the combined data to a file
    const fileName = `../rawdata/${symbol}-historical-data.json`;
    fs.writeFile(
      fileName,
      JSON.stringify({ symbol, values: allValues }, null, 2),
      (err) => {
        if (err) {
          console.error(`Failed to write file: ${err.message}`);
        } else {
          console.log(`All data written to '${fileName}'`);
        }
      }
    );
  }
})();
