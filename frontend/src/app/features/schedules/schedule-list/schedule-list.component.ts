import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScheduleService } from '../../../core/services/schedule.service';
import { Schedule } from '../../../core/models/schedule.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule, MatButtonModule, MatIconModule, MatCardModule,
    MatChipsModule, MatTooltipModule, MatSnackBarModule, MatDialogModule,
    MatProgressSpinnerModule, DatePipe,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Schedules</h1>
        <p class="subtitle">Manage tip delivery schedules</p>
      </div>
      <a mat-flat-button color="primary" routerLink="/schedules/new">
        <mat-icon>add</mat-icon> New Schedule
      </a>
    </div>

    @if (loading) {
      <div class="spinner-center"><mat-spinner /></div>
    } @else if (schedules.length === 0) {
      <mat-card class="empty-card">
        <mat-card-content>
          <mat-icon>schedule</mat-icon>
          <p>No schedules yet. Create a schedule to automate tip delivery.</p>
          <a mat-flat-button color="primary" routerLink="/schedules/new">Create Schedule</a>
        </mat-card-content>
      </mat-card>
    } @else {
      <mat-card>
        <table mat-table [dataSource]="schedules" class="full-width">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let s"><strong>{{ s.name }}</strong></td>
          </ng-container>

          <ng-container matColumnDef="topic">
            <th mat-header-cell *matHeaderCellDef>Topic</th>
            <td mat-cell *matCellDef="let s">{{ s.topic.name }}</td>
          </ng-container>

          <ng-container matColumnDef="channel">
            <th mat-header-cell *matHeaderCellDef>Channel</th>
            <td mat-cell *matCellDef="let s">{{ s.channel.name }}</td>
          </ng-container>

          <ng-container matColumnDef="sendTimes">
            <th mat-header-cell *matHeaderCellDef>Send Times</th>
            <td mat-cell *matCellDef="let s">
              <mat-chip-set>
                @for (t of s.sendTimes; track t) {
                  <mat-chip class="time-chip">{{ t }}</mat-chip>
                }
              </mat-chip-set>
            </td>
          </ng-container>

          <ng-container matColumnDef="timezone">
            <th mat-header-cell *matHeaderCellDef>Timezone</th>
            <td mat-cell *matCellDef="let s">{{ s.timezone }}</td>
          </ng-container>

          <ng-container matColumnDef="active">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let s">
              <span class="active-badge" [class.inactive]="!s.active">
                {{ s.active ? 'Active' : 'Paused' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let s">
              <div class="actions">
                <button mat-icon-button color="accent" [routerLink]="['/schedules', s.id, 'edit']" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="toggle(s)" [matTooltip]="s.active ? 'Pause' : 'Activate'">
                  <mat-icon>{{ s.active ? 'pause_circle' : 'play_circle' }}</mat-icon>
                </button>
                <button mat-icon-button color="primary" (click)="triggerNow(s)" matTooltip="Send tip now"
                        [disabled]="triggering === s.id">
                  <mat-icon>send</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="delete(s)" matTooltip="Delete">
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
    .time-chip { font-size: .8rem; }
    .active-badge { padding: 3px 10px; border-radius: 12px; font-size: .78rem; background: #e8f5e9; color: #2e7d32; }
    .active-badge.inactive { background: #fff3e0; color: #e65100; }
    .actions { display: flex; gap: 2px; }
  `],
})
export class ScheduleListComponent implements OnInit {
  schedules: Schedule[] = [];
  loading = true;
  triggering: number | null = null;
  columns = ['name', 'topic', 'channel', 'sendTimes', 'timezone', 'active', 'actions'];

  constructor(
    private scheduleSvc: ScheduleService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.scheduleSvc.getAll().subscribe({
      next: data => { this.schedules = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  toggle(schedule: Schedule) {
    this.scheduleSvc.toggle(schedule.id).subscribe({
      next: updated => {
        const idx = this.schedules.findIndex(s => s.id === schedule.id);
        if (idx >= 0) this.schedules[idx] = updated;
        this.snackBar.open(`Schedule ${updated.active ? 'activated' : 'paused'}`, 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Toggle failed', 'Close', { duration: 3000 }),
    });
  }

  triggerNow(schedule: Schedule) {
    this.triggering = schedule.id;
    this.scheduleSvc.trigger(schedule.id).subscribe({
      next: () => {
        this.triggering = null;
        this.snackBar.open('Tip sent successfully!', 'Close', { duration: 4000, panelClass: 'snack-success' });
      },
      error: () => {
        this.triggering = null;
        this.snackBar.open('Send failed', 'Close', { duration: 3000 });
      },
    });
  }

  delete(schedule: Schedule) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Schedule', message: `Delete "${schedule.name}"? This will remove the Quartz job permanently.` },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.scheduleSvc.delete(schedule.id).subscribe({
        next: () => { this.snackBar.open('Schedule deleted', 'Close', { duration: 3000 }); this.load(); },
        error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 }),
      });
    });
  }
}
