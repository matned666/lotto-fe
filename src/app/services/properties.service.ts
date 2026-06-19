import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../core/config/app-config.service';
import { Observable } from 'rxjs';
import { Properties } from '../model/properties';

@Injectable({ providedIn: 'root' })
export class PropertiesService {

  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(AppConfigService);

  getProperties(): Observable<Properties[]> {
    return this.http.get<Properties[]>(`${this.appConfig.backendUrl}/api/props`);
  }

  /**
   * wysyla update na properties
   * @param property
   * @return zwraca listę wszystkich propertisów
   */
  postChanges(property: Properties): Observable<Properties[] | void> {
    return this.http.post<Properties[]>(`${this.appConfig.backendUrl}/api/props`, property);
  }

}
