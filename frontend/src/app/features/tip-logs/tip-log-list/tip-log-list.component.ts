import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TipService } from '../../../core/services/tip.service';
import { TopicService } from '../../../core/services/topic.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { TipLog, TipStatus } from '../../../core/models/tip-log.model';
import { Topic } from '../../../core/models/topic.model';
import { Schedule } from '../../../core/models/schedule.model';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-tip-log-list',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatPaginatorModule, MatTooltipModule, MatProgressSpinnerModule,
    DatePipe,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Tip Logs</h1>
        <p class="subtitle">History of all generated and delivered tips</p>
      </div>
    </div>

    <!-- Filters -->
    <mat-card class="filter-card">
      <mat-card-content>
        <form [formGroup]="filterForm" class="filter-row">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Filter by Topic</mat-label>
            <mat-select formControlName="topicId">
              <mat-option [value]="null">All Topics</mat-option>
              @for (t of topics; track t.id) {
                <mat-option [value]="t.id">{{ t.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Filter by Schedule</mat-label>
            <mat-select formControlName="scheduleId">
              <mat-option [value]="null">All Schedules</mat-option>
              @for (s of schedules; track s.id) {
                <mat-option [value]="s.id">{{ s.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option [value]="null">All Statuses</mat-option>
              <mat-option value="SENT">Sent</mat-option>
              <mat-option value="FAILED">Failed</mat-option>
              <mat-option value="PREVIEW">Preview</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button type="button" (click)="resetFilters()">
            <mat-icon>clear</mat-icon> Reset
          </button>
        </form>
      </mat-card-content>
    </mat-card>

    @if (loading) {
      <div class="spinner-center"><mat-spinner /></div>
    } @else if (logs.length === 0) {
      <mat-card class="empty-card">
        <mat-card-content>
          <mat-icon>history</mat-icon>
          <p>No tip logs found for the selected filters.</p>
        </mat-card-content>
      </mat-card>
    } @else {
      <mat-card>
        <table mat-table [dataSource]="logs" class="full-width">
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let l">
              <span class="status-badge" [class]="'badge-' + l.status.toLowerCase()">{{ l.status }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="topic">
            <th mat-header-cell *matHeaderCellDef>Topic</th>
            <td mat-cell *matCellDef="let l">{{ l.topicName }}</td>
          </ng-container>

          <ng-container matColumnDef="schedule">
            <th mat-header-cell *matHeaderCellDef>Schedule</th>
            <td mat-cell *matCellDef="let l">{{ l.scheduleName }}</td>
          </ng-container>

          <ng-container matColumnDef="channel">
            <th mat-header-cell *matHeaderCellDef>Channel</th>
            <td mat-cell *matCellDef="let l">{{ l.channelName }}</td>
          </ng-container>

          <ng-container matColumnDef="triggeredBy">
            <th mat-header-cell *matHeaderCellDef>Trigger</th>
            <td mat-cell *matCellDef="let l">
              <span class="trigger-badge" [class.manual]="l.triggeredBy === 'MANUAL'">
                {{ l.triggeredBy }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="tokens">
            <th mat-header-cell *matHeaderCellDef>Tokens</th>
            <td mat-cell *matCellDef="let l">
              {{ l.totalTokens != null ? l.totalTokens : '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let l">{{ l.createdAt | date:'MMM d, y HH:mm' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let l">
              <button mat-icon-button (click)="viewDetail(l)" matTooltip="View details">
                <mat-icon>open_in_new</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;" class="table-row"></tr>
        </table>

        <mat-paginator
          [length]="totalElements"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)"
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 1.8rem; }
    .subtitle { color: #666; margin: 4px 0 0; }
    .filter-card { margin-bottom: 16px; border-radius: 12px !important; }
    .filter-row { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
    .filter-field { min-width: 180px; }
    .spinner-center { display: flex; justify-content: center; padding: 80px; }
    .empty-card mat-card-content { display: flex; flex-direction: column; align-items: center; padding: 60px !important; color: #999; gap: 12px; }
    .empty-card mat-icon { font-size: 56px; width: 56px; height: 56px; }
    .full-width { width: 100%; }
    .table-row:hover { background: #f5f5f5; }
    .status-badge { padding: 3px 10px; border-radius: 12px; font-size: .75rem; font-weight: 500; }
    .badge-sent { background: #e8f5e9; color: #2e7d32; }
    .badge-failed { background: #ffebee; color: #c62828; }
    .badge-preview { background: #fff3e0; color: #e65100; }
    .trigger-badge { font-size: .78rem; color: #555; }
    .trigger-badge.manual { color: #1976d2; font-weight: 500; }
  `],
})
export class TipLogListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  logs: TipLog[] = [];
  topics: Topic[] = [];
  schedules: Schedule[] = [];
  loading = true;
  totalElements = 0;
  pageSize = 20;
  currentPage = 0;

  columns = ['status', 'topic', 'schedule', 'channel', 'triggeredBy', 'tokens', 'createdAt', 'actions'];

  filterForm = this.fb.group({
    topicId: [null as number | null],
    scheduleId: [null as number | null],
    status: [null as TipStatus | null],
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private tipSvc: TipService,
    private topicSvc: TopicService,
    private scheduleSvc: ScheduleService,
  ) {}

  ngOnInit() {
    forkJoin({
      topics: this.topicSvc.getAll(),
      schedules: this.scheduleSvc.getAll(),
    }).subscribe(({ topics, schedules }) => {
      this.topics = topics;
      this.schedules = schedules;
    });

    this.filterForm.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 0;
      this.loadLogs();
    });

    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    const v = this.filterForm.value;
    this.tipSvc.getLogs({
      page: this.currentPage,
      size: this.pageSize,
      topicId: v.topicId ?? undefined,
      scheduleId: v.scheduleId ?? undefined,
      status: v.status ?? undefined,
    }).subscribe({
      next: page => {
        this.logs = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  onPage(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLogs();
  }

  resetFilters() {
    this.filterForm.reset({ topicId: null, scheduleId: null, status: null });
  }

  viewDetail(log: TipLog) {
    this.router.navigate(['/tip-logs', log.id], { state: { log } });
  }
}
