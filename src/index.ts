// import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config({ path: ".env" });
import http from 'http';

const server = http.createServer();

const client = createClient({
  url: process.env.EXTERNAL_REDIS_URL,
});

// const prisma = new PrismaClient();

async function processMessage(message: string) {
  try {
    // await prisma.message.create({
    //   data: {
    //     content: message,
    //   },
    // });
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
          await processMessage(messageData[1]);
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

server.listen(3000);