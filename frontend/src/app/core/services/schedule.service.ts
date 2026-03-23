import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { Schedule, ScheduleRequest } from '../models/schedule.model';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private base = '/api/schedules';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<ApiResponse<Schedule[]>>(this.base).pipe(map(r => r.data));
  }

  getById(id: number) {
    return this.http.get<ApiResponse<Schedule>>(`${this.base}/${id}`).pipe(map(r => r.data));
  }

  create(req: ScheduleRequest) {
    return this.http.post<ApiResponse<Schedule>>(this.base, req).pipe(map(r => r.data));
  }

  update(id: number, req: ScheduleRequest) {
    return this.http.put<ApiResponse<Schedule>>(`${this.base}/${id}`, req).pipe(map(r => r.data));
  }

  toggle(id: number) {
    return this.http.patch<ApiResponse<Schedule>>(`${this.base}/${id}/toggle`, {}).pipe(map(r => r.data));
  }

  trigger(id: number) {
    return this.http.post<ApiResponse<void>>(`${this.base}/${id}/trigger`, {});
  }

  delete(id: number) {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }
}
