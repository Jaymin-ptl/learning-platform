import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ApiResponse, Page } from '../models/api-response.model';
import { TipLog, TipStatus } from '../models/tip-log.model';

@Injectable({ providedIn: 'root' })
export class TipService {
  constructor(private http: HttpClient) {}

  getLogs(filters: { page?: number; size?: number; topicId?: number; scheduleId?: number; status?: TipStatus }) {
    let params = new HttpParams()
      .set('page', filters.page ?? 0)
      .set('size', filters.size ?? 20);
    if (filters.topicId) params = params.set('topicId', filters.topicId);
    if (filters.scheduleId) params = params.set('scheduleId', filters.scheduleId);
    if (filters.status) params = params.set('status', filters.status);
    return this.http.get<ApiResponse<Page<TipLog>>>('/api/tips/logs', { params }).pipe(map(r => r.data));
  }

  sendNow(scheduleId: number) {
    return this.http.post<ApiResponse<void>>(`/api/tips/send-now/${scheduleId}`, {});
  }
}
