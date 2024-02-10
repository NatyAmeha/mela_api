import { Injectable, LogLevel, LoggerService } from '@nestjs/common';

@Injectable()
export class AppLogger implements LoggerService {
    log(message: any, ...optionalParams: any[]) {
        console.log("Log", message)
    }
    error(message: any, ...optionalParams: any[]) {
        console.log("error", message)
    }
    warn(message: any, ...optionalParams: any[]) {
        console.log("warn", message)
    }
    debug?(message: any, ...optionalParams: any[]) {
        console.log("debug", message)
    }
    verbose?(message: any, ...optionalParams: any[]) {
        console.log("Verbose", message)
    }
    fatal?(message: any, ...optionalParams: any[]) {
        console.log("fatal", message)
    }
    setLogLevels?(levels: LogLevel[]) {

    }
}
