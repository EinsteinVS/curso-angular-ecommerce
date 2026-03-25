import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TrackingService {

  track(event: string, data: any = {}) {
    console.log('Tracking:', event, data);
    // Qui puoi integrare GA4, DY, Segment, ecc.
  }
}
