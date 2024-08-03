import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config({ path: ".env" });
import http from 'http';

const prisma = new PrismaClient();

const requestHandler = (request: http.IncomingMessage, response: http.ServerResponse) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Hello, World!\n');
    response.setHeader('Access-Control-Allow-Origin', '*'); // Or specify 'http://localhost:3000' instead of '*'
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  };  

const server = http.createServer(requestHandler);

const client = createClient({
  url: process.env.EXTERNAL_REDIS_URL,
});

console.log('redis Worker started:', process.env.EXTERNAL_REDIS_URL);

async function processMessage(message: string) {
  try {
    await prisma.message.create({
      data: {
        content: message,
      },
    });
    console.log('Message saved to database');
  } catch (error) {
    console.error('Error saving message to database:', error);
  }
}

async function startWorker() {
  
  try{
    await client.connect();
    console.log('Connected to Redis from worker');

    while (true) {
      try {
        const messageData = await client.brPop("newMessages", 0);
        //@ts-ignore
        if (messageData.element) {
          //@ts-ignore
          await processMessage(messageData.element);
          console.log('Message processed in BG WORKER');
        } else {
          console.log('NO MESSAGE IN BG WORKER');
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    }
  }catch(e){
    console.error('Error connecting to Redis:', e);
  }
}

startWorker();

server.listen(4000);