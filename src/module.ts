import { Module } from "@nestjs/common";
import { WaitingController } from "./controller";

@Module({
    controllers: [WaitingController]
})
export class AppModule {}
