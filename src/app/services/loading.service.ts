import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  public isLoading$: Observable<boolean>;
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  constructor() {
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  public showLoading() {
    this.isLoadingSubject.next(true);
  }

  public hideLoading() {
    this.isLoadingSubject.next(false);
  }
}
