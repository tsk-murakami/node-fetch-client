
import jsonServer from "json-server";
import fs from "fs";
import path from "path";
import { DB } from "./db";

const DB_PATH = path.resolve(__dirname, 'db.json')

fs.writeFileSync(DB_PATH, JSON.stringify(DB) )

const app = jsonServer.create();
const route = jsonServer.router(DB_PATH);
const middlewares = jsonServer.defaults()

app.use( middlewares )
app.use( route );

export default app;