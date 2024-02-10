import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonService {

    getDataFromCommongLib() { 
        return "data from common library";
    }
}
