import { Component, OnInit } from '@angular/core';
import { NoteService } from './service/note.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, startWith, catchError } from 'rxjs/operators';
import { AppState } from './interface/appstate';
import { CustomHttpResponse } from './interface/custom-http-response';
import { DataState } from './enum/datastate';
import { Level } from './enum/level';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
  
})
export class AppComponent implements OnInit {

  appState$: Observable<AppState<CustomHttpResponse>> | undefined;
  readonly Level = Level; 
  readonly DataState = DataState; 
  private dataSubject = new BehaviorSubject<CustomHttpResponse | undefined>(undefined); 

  constructor(private noteService: NoteService) { }

  ngOnInit(): void {
    this.appState$ = this.noteService.notes$
      .pipe(
        // if there is a response -> DataState.LOADED
        map(response => {
          this.dataSubject.next(response)
          return { dataState: DataState.LOADED, data: response }
        }),
        // first state is LOADING
        startWith({ dataState: DataState.LOADING }),
         
        catchError((error: string) => {
          return of({ dataState: DataState.ERROR, error: error })
        })
      );
  }

  saveNote(noteForm: NgForm): void {
    this.appState$ = this.noteService.save$(noteForm.value)
      .pipe(
        // if there is a response -> DataState.LOADED
        map(response => {
          this.dataSubject
          .next(<CustomHttpResponse>{...this.dataSubject.value, notes: [response.notes![0], ...this.dataSubject.value!.notes!]});
          noteForm.reset({title: '', description: '', level: this.Level.HIGH });
          return { dataState: DataState.LOADED, data: this.dataSubject.value };
        }),
        // first state is LOADING
        startWith({ dataState: DataState.LOADING, data: this.dataSubject.value}),
         
        catchError((error: string) => {
          return of({ dataState: DataState.ERROR, error: error })
        })
      );
  }

// this is a comment to get a change to be able to commit ;) 

}
