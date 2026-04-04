import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { filter, switchMap, take, takeUntil } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TokenRefreshService {

  private refreshing = false;
  private readonly tokenSubject = new BehaviorSubject<string | null>(null);
  private readonly refreshFailed$ = new Subject<void>();

  get isRefreshing(): boolean {
    return this.refreshing;
  }

  startRefresh(): void {
    this.refreshing = true;
    this.tokenSubject.next(null);
  }

  completeRefresh(token: string): void {
    this.tokenSubject.next(token);
  }

  /** Sblocca le richieste in coda con un errore, evitando zombie subscriptions */
  failRefresh(): void {
    this.refreshFailed$.next();
  }

  finishRefresh(): void {
    this.refreshing = false;
  }

  /**
   * Aspetta il prossimo token valido.
   * Se il refresh fallisce, l'observable emette un errore invece di restare bloccato.
   */
  waitForToken$() {
    return this.tokenSubject.pipe(
      filter((token): token is string => !!token),
      take(1),
      takeUntil(
        this.refreshFailed$.pipe(
          switchMap(() => throwError(() => new Error('REFRESH_FAILED')))
        )
      )
    );
  }
}
