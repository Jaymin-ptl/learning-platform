import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { TipService } from '../../../core/services/tip.service';
import { TipLog } from '../../../core/models/tip-log.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-tip-log-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatDividerModule, MatExpansionModule,
    DatePipe,
  ],
  template: `
    <div class="page-header">
      <button mat-icon-button routerLink="/tip-logs"><mat-icon>arrow_back</mat-icon></button>
      <div>
        <h1>Tip Log Detail</h1>
        <p class="subtitle">Full details of a generated tip</p>
      </div>
    </div>

    @if (loading) {
      <div class="spinner-center"><mat-spinner /></div>
    } @else if (!log) {
      <mat-card>
        <mat-card-content class="not-found">
          <mat-icon>error_outline</mat-icon>
          <p>Tip log not found.</p>
          <a mat-flat-button routerLink="/tip-logs">Back to list</a>
        </mat-card-content>
      </mat-card>
    } @else {
      <div class="detail-grid">
        <!-- Meta card -->
        <mat-card class="meta-card">
          <mat-card-header>
            <mat-card-title>
              <span class="status-badge" [class]="'badge-' + log.status.toLowerCase()">{{ log.status }}</span>
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <dl class="meta-dl">
              <dt>Topic</dt>     <dd>{{ log.topicName }}</dd>
              <dt>Schedule</dt>  <dd>{{ log.scheduleName }}</dd>
              <dt>Channel</dt>   <dd>{{ log.channelName }}</dd>
              <dt>Triggered by</dt> <dd>{{ log.triggeredBy }}</dd>
              <dt>Date</dt>      <dd>{{ log.createdAt | date:'MMMM d, y — HH:mm:ss' }}</dd>
              @if (log.errorMessage) {
                <dt>Error</dt>
                <dd class="error-msg">{{ log.errorMessage }}</dd>
              }
            </dl>

            @if (log.modelUsed || log.totalTokens != null) {
              <mat-divider class="divider" />
              <h3 class="section-title">AI Usage</h3>
              <dl class="meta-dl">
                @if (log.modelUsed) { <dt>Model</dt><dd>{{ log.modelUsed }}</dd> }
                @if (log.promptTokens != null) { <dt>Prompt tokens</dt><dd>{{ log.promptTokens }}</dd> }
                @if (log.completionTokens != null) { <dt>Completion tokens</dt><dd>{{ log.completionTokens }}</dd> }
                @if (log.totalTokens != null) { <dt>Total tokens</dt><dd><strong>{{ log.totalTokens }}</strong></dd> }
              </dl>
            }
          </mat-card-content>
        </mat-card>

        <!-- Tip content -->
        <div class="content-col">
          <mat-card class="tip-card">
            <mat-card-header>
              <mat-card-title>Generated Tip</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <pre class="tip-content">{{ log.generatedTip }}</pre>
            </mat-card-content>
          </mat-card>

          @if (log.promptUsed) {
            <mat-expansion-panel class="prompt-panel">
              <mat-expansion-panel-header>
                <mat-panel-title><mat-icon>code</mat-icon> Prompt Used</mat-panel-title>
              </mat-expansion-panel-header>
              <pre class="prompt-content">{{ log.promptUsed }}</pre>
            </mat-expansion-panel>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 1.8rem; }
    .subtitle { color: #666; margin: 4px 0 0; }
    .spinner-center { display: flex; justify-content: center; padding: 80px; }
    .not-found { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #999; gap: 12px; }
    .not-found mat-icon { font-size: 56px; width: 56px; height: 56px; }

    .detail-grid { display: grid; grid-template-columns: 300px 1fr; gap: 24px; align-items: start; }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }

    .meta-card { border-radius: 12px !important; }
    .status-badge { padding: 4px 12px; border-radius: 12px; font-size: .85rem; font-weight: 500; }
    .badge-sent { background: #e8f5e9; color: #2e7d32; }
    .badge-failed { background: #ffebee; color: #c62828; }
    .badge-preview { background: #fff3e0; color: #e65100; }

    .meta-dl { display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; margin: 0; font-size: .9rem; }
    dt { font-weight: 500; color: #666; }
    dd { margin: 0; word-break: break-word; }
    .error-msg { color: #c62828; }
    .divider { margin: 16px 0; }
    .section-title { font-size: .95rem; margin: 0 0 8px; color: #444; }

    .content-col { display: flex; flex-direction: column; gap: 16px; }
    .tip-card { border-radius: 12px !important; }
    .tip-content { white-space: pre-wrap; font-family: inherit; font-size: .92rem; line-height: 1.7; margin: 0; color: #333; }

    .prompt-panel { border: 1px solid #e0e0e0; border-radius: 8px !important; box-shadow: none !important; }
    .prompt-panel mat-panel-title { display: flex; align-items: center; gap: 8px; }
    .prompt-content { white-space: pre-wrap; font-size: .82rem; font-family: monospace; line-height: 1.6; color: #555; margin: 0; padding: 8px; background: #f5f5f5; border-radius: 6px; }
  `],
})
export class TipLogDetailComponent implements OnInit {
  log: TipLog | null = null;
  loading = true;
  private logId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tipSvc: TipService,
  ) {}

  ngOnInit() {
    this.logId = +this.route.snapshot.paramMap.get('id')!;

    // Try to get the log from router navigation state first (passed by list component)
    const state = this.router.getCurrentNavigation()?.extras?.state as { log?: TipLog } | undefined;
    if (state?.log) {
      this.log = state.log;
      this.loading = false;
      return;
    }

    // Fall back: search pages until found
    this.findLog(0);
  }

  private findLog(page: number) {
    this.tipSvc.getLogs({ page, size: 50 }).subscribe({
      next: p => {
        const found = p.content.find(l => l.id === this.logId);
        if (found) {
          this.log = found;
          this.loading = false;
        } else if (page + 1 < p.totalPages) {
          this.findLog(page + 1);
        } else {
          this.loading = false;
        }
      },
      error: () => { this.loading = false; },
    });
  }
}
