"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
// 1) DATABASE CONFIGURATIONS
const DB = process.env.DATABASE_URL.replace('<db_password>', process.env.DATABASE_PASSWORD);
mongoose_1.default
    .connect(DB)
    .then(() => console.log('Connected to database!'))
    .catch((err) => console.log(err));
// 2) SERVER
const port = +process.env.PORT;
app_1.default.get('/', (req, res) => {
    res.send('Hello from Vercel!');
});
app_1.default.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
