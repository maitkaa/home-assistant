import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
// import { remember } from "@epic-web/remember"; TODO-MAIT decide on this

const connectionString = "..."
const sql = postgres(connectionString, { max: 1 })
const dbServer = drizzle(sql);

await migrate(dbServer, { migrationsFolder: "drizzle" });

await sql.end();