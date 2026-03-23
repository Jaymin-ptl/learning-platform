import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TeamsChannelService } from '../../../core/services/teams-channel.service';
import { TeamsChannel } from '../../../core/models/teams-channel.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule, MatButtonModule, MatIconModule, MatCardModule,
    MatTooltipModule, MatSnackBarModule, MatDialogModule,
    MatProgressSpinnerModule, DatePipe,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Teams Channels</h1>
        <p class="subtitle">Manage Microsoft Teams webhook channels</p>
      </div>
      <a mat-flat-button color="primary" routerLink="/channels/new">
        <mat-icon>add</mat-icon> New Channel
      </a>
    </div>

    @if (loading) {
      <div class="spinner-center"><mat-spinner /></div>
    } @else if (channels.length === 0) {
      <mat-card class="empty-card">
        <mat-card-content>
          <mat-icon>chat</mat-icon>
          <p>No channels yet. Add a Microsoft Teams webhook to get started.</p>
          <a mat-flat-button color="primary" routerLink="/channels/new">Add Channel</a>
        </mat-card-content>
      </mat-card>
    } @else {
      <mat-card>
        <table mat-table [dataSource]="channels" class="full-width">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let c"><strong>{{ c.name }}</strong></td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let c">{{ c.description || '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="webhookUrl">
            <th mat-header-cell *matHeaderCellDef>Webhook URL</th>
            <td mat-cell *matCellDef="let c">
              <span class="webhook-url" [matTooltip]="c.webhookUrl">{{ truncate(c.webhookUrl, 45) }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="active">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let c">
              <span class="active-badge" [class.inactive]="!c.active">
                {{ c.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="updatedAt">
            <th mat-header-cell *matHeaderCellDef>Updated</th>
            <td mat-cell *matCellDef="let c">{{ c.updatedAt | date:'MMM d, y' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let c">
              <div class="actions">
                <button mat-icon-button color="accent" [routerLink]="['/channels', c.id, 'edit']" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="delete(c)" matTooltip="Deactivate">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;" class="table-row"></tr>
        </table>
      </mat-card>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 1.8rem; }
    .subtitle { color: #666; margin: 4px 0 0; }
    .spinner-center { display: flex; justify-content: center; padding: 80px; }
    .empty-card mat-card-content { display: flex; flex-direction: column; align-items: center; padding: 60px !important; color: #999; gap: 12px; }
    .empty-card mat-icon { font-size: 56px; width: 56px; height: 56px; }
    .full-width { width: 100%; }
    .table-row:hover { background: #f5f5f5; }
    .webhook-url { font-family: monospace; font-size: .82rem; color: #555; cursor: default; }
    .active-badge { padding: 3px 10px; border-radius: 12px; font-size: .78rem; background: #e8f5e9; color: #2e7d32; }
    .active-badge.inactive { background: #fafafa; color: #9e9e9e; }
    .actions { display: flex; gap: 4px; }
  `],
})
export class ChannelListComponent implements OnInit {
  channels: TeamsChannel[] = [];
  loading = true;
  columns = ['name', 'description', 'webhookUrl', 'active', 'updatedAt', 'actions'];

  constructor(
    private channelSvc: TeamsChannelService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.channelSvc.getAll().subscribe({
      next: data => { this.channels = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  truncate(s: string, len: number) { return s.length > len ? s.slice(0, len) + '…' : s; }

  delete(channel: TeamsChannel) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Deactivate Channel', message: `Deactivate "${channel.name}"?` },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.channelSvc.delete(channel.id).subscribe({
        next: () => { this.snackBar.open('Channel deactivated', 'Close', { duration: 3000 }); this.load(); },
        error: () => this.snackBar.open('Failed to deactivate', 'Close', { duration: 3000 }),
      });
    });
  }
}
