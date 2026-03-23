import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { TeamsChannel, TeamsChannelRequest } from '../models/teams-channel.model';

@Injectable({ providedIn: 'root' })
export class TeamsChannelService {
  private base = '/api/channels';

  constructor(private http: HttpClient) {}

  getAll(activeOnly = false) {
    const params = new HttpParams().set('activeOnly', activeOnly);
    return this.http.get<ApiResponse<TeamsChannel[]>>(this.base, { params }).pipe(map(r => r.data));
  }

  getById(id: number) {
    return this.http.get<ApiResponse<TeamsChannel>>(`${this.base}/${id}`).pipe(map(r => r.data));
  }

  create(req: TeamsChannelRequest) {
    return this.http.post<ApiResponse<TeamsChannel>>(this.base, req).pipe(map(r => r.data));
  }

  update(id: number, req: TeamsChannelRequest) {
    return this.http.put<ApiResponse<TeamsChannel>>(`${this.base}/${id}`, req).pipe(map(r => r.data));
  }

  delete(id: number) {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }
}
