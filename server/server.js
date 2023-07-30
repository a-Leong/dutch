import { WebSocketServer } from "ws";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getDatabase, ServerValue } from "firebase-admin/database";

const app = initializeApp({
  credential: applicationDefault(),
  databaseURL: "https://dutch-cards-default-rtdb.firebaseio.com",
});
const database = getDatabase(app);
const firestore = getFirestore(app);

const wss = new WebSocketServer({ port: 3000, host: "0.0.0.0" });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", async (message) => {
    switch (message.toString()) {
      case "increment-doc-count": {
        await firestore
          .doc("admin/sandbox")
          .update({ count: FieldValue.increment(1) });
        ws.send("done");
        break;
      }

      case "increment-db-obj-count": {
        await database
          .ref("admin/sandbox")
          .update({ count: ServerValue.increment(1) });
        ws.send("done");
        break;
      }
    }
  });
});

console.log("Listening on port 3000");
