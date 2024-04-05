import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { RMQService, IRMQService } from "./rmq_client.interface";
import { AppMessageBrocker } from "./app_message_brocker";

@Module({
    imports: [
        ConfigModule,
    ],
    providers: [
        {
            provide: RMQService.InjectName,
            useClass: RMQService
        },

    ],
    exports: [RMQService.InjectName]
})
export class RmqModule {

}