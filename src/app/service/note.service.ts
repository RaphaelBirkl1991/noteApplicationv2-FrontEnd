import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CustomHttpResponse } from '../interface/custom-http-response';
import { Note } from '../interface/note';

@Injectable({
  providedIn: 'root'
})
export class NoteService {


 //  private readonly server = 'http://localhost:4200';

   private readonly server = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  notes$ = <Observable<CustomHttpResponse>>this.http.get<CustomHttpResponse>
    (`${this.server}/note/all`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  save$ = (note: Note) => <Observable<CustomHttpResponse>>this.http.post<CustomHttpResponse>
    (`${this.server}/note/add`, note)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  update$ = (note: Note) => <Observable<CustomHttpResponse>>this.http.put<CustomHttpResponse>
    (`${this.server}/note/update`, note)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  delete$ = (noteId: number) => <Observable<CustomHttpResponse>>this.http.delete<CustomHttpResponse>
    (`${this.server}/note/delete/${noteId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );



  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log("in handle error method!", error);
    console.log(error);
    let errorMessage: string;
    // check if frontend error
    if(error.error instanceof ErrorEvent){     
        errorMessage = `A client error occurred - ${error.error.message}`;
    } else {
      // error.error    1. error = error: HttpErrorResponse 2. error = error of error response (from Backend) 
       if (error.error.reason) {
        errorMessage = `${error.error.reason} - Error code ${error.status}`;
       } else{
        errorMessage = `An error occurred - Error code ${error.status}`;
       }
    }
    return throwError(errorMessage);
  }
}