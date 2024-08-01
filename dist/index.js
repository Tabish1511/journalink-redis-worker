"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { PrismaClient } from '@prisma/client';
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: ".env" });
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer();
const client = (0, redis_1.createClient)({
    url: process.env.EXTERNAL_REDIS_URL,
});
// const prisma = new PrismaClient();
function processMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // await prisma.message.create({
            //   data: {
            //     content: message,
            //   },
            // });
            console.log('Message saved to database');
        }
        catch (error) {
            console.error('Error saving message to database:', error);
        }
    });
}
function startWorker() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            console.log('Connected to Redis from worker');
            while (true) {
                try {
                    const messageData = yield client.brPop("newMessages", 0);
                    //@ts-ignore
                    if (messageData.element) {
                        //@ts-ignore
                        yield processMessage(messageData[1]);
                        console.log('Message processed in BG WORKER');
                    }
                    else {
                        console.log('NO MESSAGE IN BG WORKER');
                    }
                }
                catch (error) {
                    console.error("Error processing message:", error);
                }
            }
        }
        catch (e) {
            console.error('Error connecting to Redis:', e);
        }
    });
}
startWorker();
server.listen(3000);
