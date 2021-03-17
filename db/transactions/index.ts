import init from "../local";
import { createAccessLevelTable, defineAccessLevel } from "../models/accessLevel";
import { createUserTable, dropUserTable } from "../models/user";


await init()
// await dropUserTable()
// await createAccessLevelTable()
// await defineAccessLevel()
// await createUserTable()


process.exit(0)
