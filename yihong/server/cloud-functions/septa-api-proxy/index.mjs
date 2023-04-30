import fetch from "node-fetch";
import functions from "@google-cloud/functions-framework";

functions.http("septaProxy", async (req, res) => {
  const route = req.query.route || "21";
  const apiUrl = `https://www3.septa.org/api/TransitView/index.php?route=${route}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.set("Access-Control-Allow-Origin", "*");
    res.json(data);
  } catch (e) {
    console.error("Error fetching data: ", e);
    res.status(500).send("Error fetching data");
  }
});
