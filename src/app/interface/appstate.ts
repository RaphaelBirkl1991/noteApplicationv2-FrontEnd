import { DataState } from "../enum/datastate";

export interface AppState<T> {
    dataState: DataState;
    data?: T; 
    error?: string; 
}
