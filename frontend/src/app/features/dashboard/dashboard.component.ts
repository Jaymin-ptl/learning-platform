import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TopicService } from '../../core/services/topic.service';
import { TeamsChannelService } from '../../core/services/teams-channel.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { TipService } from '../../core/services/tip.service';
import { DatePipe } from '@angular/common';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, DatePipe],
  template: `
    <div class="page-header">
      <h1>Dashboard</h1>
      <p class="subtitle">Overview of your learning platform</p>
    </div>

    @if (loading) {
      <div class="spinner-center"><mat-spinner /></div>
    } @else {
      <div class="stats-grid">
        @for (card of statCards; track card.label) {
          <mat-card class="stat-card" [routerLink]="card.route">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-info">
                  <span class="stat-value">{{ card.value }}</span>
                  <span class="stat-label">{{ card.label }}</span>
                </div>
                <div class="stat-icon" [style.background]="card.color">
                  <mat-icon>{{ card.icon }}</mat-icon>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <div class="recent-section">
        <h2>Recent Tip Logs</h2>
        @if (recentLogs.length === 0) {
          <mat-card>
            <mat-card-content class="empty">
              <mat-icon>history</mat-icon>
              <p>No tip logs yet. Trigger a schedule to generate tips.</p>
            </mat-card-content>
          </mat-card>
        } @else {
          <div class="log-list">
            @for (log of recentLogs; track log.id) {
              <mat-card class="log-card" [routerLink]="['/tip-logs', log.id]">
                <mat-card-content>
                  <div class="log-row">
                    <span class="status-dot" [class]="'status-' + log.status.toLowerCase()"></span>
                    <div class="log-info">
                      <strong>{{ log.topicName }}</strong>
                      <span class="log-meta">{{ log.scheduleName }} · {{ log.channelName }}</span>
                    </div>
                    <div class="log-right">
                      <span class="status-badge" [class]="'badge-' + log.status.toLowerCase()">{{ log.status }}</span>
                      <span class="log-date">{{ log.createdAt | date:'MMM d, HH:mm' }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>
          <div class="view-all">
            <a mat-button color="primary" routerLink="/tip-logs">View all tip logs →</a>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 28px; }
    h1 { margin: 0; font-size: 1.8rem; }
    .subtitle { color: #666; margin: 4px 0 0; }

    .spinner-center { display: flex; justify-content: center; padding: 80px; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      cursor: pointer;
      transition: box-shadow .2s;
      border-radius: 12px !important;
    }
    .stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.12) !important; }

    .stat-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-value { display: block; font-size: 2.2rem; font-weight: 700; }
    .stat-label { display: block; color: #666; font-size: .9rem; }

    .stat-icon {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    h2 { font-size: 1.2rem; margin-bottom: 16px; }

    .log-card {
      margin-bottom: 8px;
      cursor: pointer;
      border-radius: 8px !important;
      transition: box-shadow .2s;
    }
    .log-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,.1) !important; }
    .log-card mat-card-content { padding: 12px 16px !important; }

    .log-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .status-sent { background: #4caf50; }
    .status-failed { background: #f44336; }
    .status-preview { background: #ff9800; }

    .log-info { flex: 1; }
    .log-meta { display: block; font-size: .8rem; color: #777; }

    .log-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }

    .status-badge {
      font-size: .72rem;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }
    .badge-sent { background: #e8f5e9; color: #2e7d32; }
    .badge-failed { background: #ffebee; color: #c62828; }
    .badge-preview { background: #fff3e0; color: #e65100; }

    .log-date { font-size: .78rem; color: #999; }

    .empty { display: flex; flex-direction: column; align-items: center; padding: 40px; color: #999; gap: 8px; }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; }

    .view-all { text-align: right; margin-top: 8px; }
  `],
})
export class DashboardComponent implements OnInit {
  loading = true;
  statCards: StatCard[] = [];
  recentLogs: any[] = [];

  constructor(
    private topicSvc: TopicService,
    private channelSvc: TeamsChannelService,
    private scheduleSvc: ScheduleService,
    private tipSvc: TipService,
  ) {}

  ngOnInit() {
    forkJoin({
      topics: this.topicSvc.getAll(),
      channels: this.channelSvc.getAll(),
      schedules: this.scheduleSvc.getAll(),
      logs: this.tipSvc.getLogs({ page: 0, size: 5 }),
    }).subscribe({
      next: ({ topics, channels, schedules, logs }) => {
        this.statCards = [
          { label: 'Topics',    value: topics.length,    icon: 'topic',    color: '#1a237e', route: '/topics' },
          { label: 'Channels',  value: channels.length,  icon: 'chat',     color: '#00796b', route: '/channels' },
          { label: 'Schedules', value: schedules.length, icon: 'schedule', color: '#6a1b9a', route: '/schedules' },
          { label: 'Tips Sent', value: logs.totalElements, icon: 'send',   color: '#e65100', route: '/tip-logs' },
        ];
        this.recentLogs = logs.content;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }
}
