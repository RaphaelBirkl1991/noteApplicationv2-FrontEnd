import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NoteService } from './service/note.service';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { map, startWith, catchError } from 'rxjs/operators';
import { AppState } from './interface/appstate';
import { CustomHttpResponse } from './interface/custom-http-response';
import { DataState } from './enum/datastate';
import { Level } from './enum/level';
import { NgForm } from '@angular/forms';
import { Note } from './interface/note';
import { NotificationService } from './service/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'], 
  changeDetection: ChangeDetectionStrategy.OnPush
  
})
export class AppComponent implements OnInit {

  appState$: Observable<AppState<CustomHttpResponse>>;
  readonly Level = Level; 
  readonly DataState = DataState; 
  private dataSubject = new BehaviorSubject<CustomHttpResponse | undefined>(undefined); 
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  private selectedNoteSubject= new Subject<Note>(); 
  selectedNote$ = this.selectedNoteSubject.asObservable(); 
  private filteredSubject = new BehaviorSubject<Level>(Level.ALL);
  filteredLevel$ = this.filteredSubject.asObservable();

  
  constructor(private noteService: NoteService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.appState$ = this.noteService.notes$
      .pipe(
        // if there is a response -> DataState.LOADED
        map(response => {
          this.dataSubject.next(response); 
          this.notificationService.onSuccess(response.message);
          this.filteredSubject.next(Level.ALL);
          return { dataState: DataState.LOADED, data: response }
        }),
        // first state is LOADING
        startWith({ dataState: DataState.LOADED}),
         
        catchError((error: string) => {
          this.notificationService.onError(error);
          return of({ dataState: DataState.ERROR, error: error })
        })
      );
  }

  saveNote(noteForm: NgForm): void {
    this.isLoadingSubject.next(true);
    this.appState$ = this.noteService.save$(noteForm.value)
      .pipe(
        // if there is a response -> DataState.LOADED
        map(response => {
          this.dataSubject
          .next({...response, notes: [response.notes![0], ...this.dataSubject.value!.notes!]});
          noteForm.reset({title: '', description: '', level: this.Level.HIGH });
          document.getElementById('closeModal').click(); 
          this.isLoadingSubject.next(false);
          this.notificationService.onSuccess(response.message);
          return { dataState: DataState.LOADED, data: this.dataSubject.value };
        }),
        // first state is LOADING
        startWith({ dataState: DataState.LOADED, data: this.dataSubject.value}),
         
        catchError((error: string) => {
          this.notificationService.onError(error);
          return of({ dataState: DataState.ERROR, error: error })
        })
      );
  }


  updateNote(note: Note): void {
    this.isLoadingSubject.next(true);
    this.appState$ = this.noteService.update$(note)
    .pipe(
      map(response => {
        this.dataSubject.value.notes[this.dataSubject.value.notes.findIndex(note =>
           note.id === response.notes[0].id)] = response.notes[0];
           this.dataSubject
           .next({...response, notes: this.dataSubject.value.notes}); 
           document.getElementById('closeModalEdit').click();
           this.filteredSubject.next(Level.ALL); 
           this.isLoadingSubject.next(false);
           this.notificationService.onSuccess(response.message);
           return {dataState: DataState.LOADED, data: this.dataSubject.value}
      }),
      startWith({dataState: DataState.LOADED, data: this.dataSubject.value}),
      catchError((error: string) => {
        this.isLoadingSubject.next(false); 
        this.notificationService.onError(error);
        return of({dataState: DataState.ERROR, error})
      })
    );
  }

  filterNotes(level: Level): void {
    this.filteredSubject.next(level);
    this.appState$ = this.noteService.filterNotes$(level, this.dataSubject.value)
    .pipe(
      map(response => {
        this.notificationService.onSuccess(response.message);
           return {dataState: DataState.LOADED, data: response}
      }),
      startWith({dataState: DataState.LOADED, data: this.dataSubject.value}),
      catchError((error: string) => {
        this.notificationService.onError(error);
        return of({dataState: DataState.ERROR, error})
      })
    );
  }


deleteNote(noteId: number): void {
  this.appState$ = this.noteService.delete$(noteId)
  .pipe(
    map(response => {
      this.dataSubject
      .next({ ...response, 
      notes: this.dataSubject.value.notes.filter(note => note.id !== response.notes[0].id)});
      this.notificationService.onSuccess(response.message);  
      this.filteredSubject.next(Level.ALL); 
      return {dataState: DataState.LOADED, data: this.dataSubject.value}
}),
    startWith({dataState: DataState.LOADED, data: this.dataSubject.value}),
    catchError((error: string) => {
      this.notificationService.onError(error);
      return of({dataState: DataState.ERROR, error})
    })
  );
}

selectNote(note: Note): void {
  this.selectedNoteSubject.next(note); 
  document.getElementById('editNoteButton').click(); 
  }

}
