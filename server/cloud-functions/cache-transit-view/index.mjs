import fetch from "node-fetch";
import storage from "@google-cloud/storage";
import functions from "@google-cloud/functions-framework";
const routes = ["21", "33", "47"];

const client = new storage.Storage();
const bucket = client.bucket("transit-view-cache");

const apiRoot = "https://www3.septa.org/api/TransitView/index.php?route=";

const getData = async (route) => {
  const apiUrl = `${apiRoot}${route}`;
  const resp = await fetch(apiUrl);
  const data = await resp.json();
  return data;
};

const processData = (data) => {
  // Filter out buses that are not in service
  const buses = data.bus.filter((bus) => bus.next_stop_id);
  // Group buses by direction
  const busesByDirection = buses.reduce((grouped, bus) => {
    const direction = bus.Direction;
    if (!grouped[direction]) {
      grouped[direction] = [];
    }
    grouped[direction].push(bus);
    return grouped;
  }, {});

  for (const direction in busesByDirection) {
    const oneWayBuses = busesByDirection[direction];
    // Sort buses by `next_stop_sequence`
    oneWayBuses.sort(
      (a, b) => parseInt(a.next_stop_sequence) - parseInt(b.next_stop_sequence)
    );
    // Get to know what is the previous bus
    for (let i = 0; i < oneWayBuses.length; i++) {
      const bus = oneWayBuses[i];
      const prevBus = oneWayBuses[i + 1];
      bus.prevTrip = prevBus ? prevBus.trip : null;
    }
  }

  return busesByDirection;
};

const saveData = async (bus, route, direction) => {
  const blob = bucket.file(`${route}/${direction}/${bus.trip}.json`);
  let tripStopSequence;
  try {
    const [blobData] = await blob.download();
    tripStopSequence = JSON.parse(blobData);
  } catch (e) {
    tripStopSequence = [];
  }

  if (
    tripStopSequence.length && // If there is existing data
    tripStopSequence[tripStopSequence.length - 1].next_stop_id ===
      bus.next_stop_id // and the bus has not moved to the next stop
  ) {
    return;
  }

  // Record the new arrival instance
  tripStopSequence.push(bus);
  const jsonData = JSON.stringify(tripStopSequence);
  await blob.save(jsonData, { resumable: false });
};

const readOnce = async () => {
  for (const route of routes) {
    const data = await getData(route);
    const busesByDirection = processData(data);

    for (const direction in busesByDirection) {
      for (const bus of busesByDirection[direction]) {
        await saveData(bus, route, direction);
      }
    }
  }
};

functions.http("cacheTransitView", async (req, res) => {
  await readOnce();
  res.set("Access-Control-Allow-Origin", "*");
  res.status(200).send("OK");
});
