import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { Topic, TopicRequest } from '../models/topic.model';

@Injectable({ providedIn: 'root' })
export class TopicService {
  private base = '/api/topics';

  constructor(private http: HttpClient) {}

  getAll(activeOnly = false) {
    const params = new HttpParams().set('activeOnly', activeOnly);
    return this.http.get<ApiResponse<Topic[]>>(this.base, { params }).pipe(map(r => r.data));
  }

  getById(id: number) {
    return this.http.get<ApiResponse<Topic>>(`${this.base}/${id}`).pipe(map(r => r.data));
  }

  create(req: TopicRequest) {
    return this.http.post<ApiResponse<Topic>>(this.base, req).pipe(map(r => r.data));
  }

  update(id: number, req: TopicRequest) {
    return this.http.put<ApiResponse<Topic>>(`${this.base}/${id}`, req).pipe(map(r => r.data));
  }

  delete(id: number) {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }

  preview(topicId: number) {
    return this.http.post<ApiResponse<string>>(`/api/tips/preview/${topicId}`, {}).pipe(map(r => r.data));
  }
}
