import { NestFactory } from "@nestjs/core";
import { INestApplication } from "@nestjs/common";
import express from 'express';

import { LISTEN_PORT } from "./config";
import { AppModule } from "./module";

async function main() {
    const app: INestApplication = await NestFactory.create(AppModule);
    app.use(express.static('./static'));
    await app.listen(LISTEN_PORT);
}

void main();