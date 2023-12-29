import { timestamp } from "rxjs";
import { Note } from "./note";

export interface CustomHttpResponse {
    timestamp: Date;
    statusCode: number;
    status: string; 
    message: string;
    reason: string; 
    developerMessage: string;
    notes?: Note[]
}


