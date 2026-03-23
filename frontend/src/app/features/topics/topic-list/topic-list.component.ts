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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { TopicService } from '../../../core/services/topic.service';
import { Topic } from '../../../core/models/topic.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-topic-list',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule, MatButtonModule, MatIconModule, MatCardModule,
    MatChipsModule, MatTooltipModule, MatSnackBarModule, MatDialogModule,
    MatSlideToggleModule, MatProgressSpinnerModule, MatBadgeModule,
    DatePipe, TitleCasePipe,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Topics</h1>
        <p class="subtitle">Manage AI learning topics</p>
      </div>
      <a mat-flat-button color="primary" routerLink="/topics/new">
        <mat-icon>add</mat-icon> New Topic
      </a>
    </div>

    @if (loading) {
      <div class="spinner-center"><mat-spinner /></div>
    } @else if (topics.length === 0) {
      <mat-card class="empty-card">
        <mat-card-content>
          <mat-icon>topic</mat-icon>
          <p>No topics yet. Create your first topic to get started.</p>
          <a mat-flat-button color="primary" routerLink="/topics/new">Create Topic</a>
        </mat-card-content>
      </mat-card>
    } @else {
      <mat-card>
        <table mat-table [dataSource]="topics" class="full-width">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let t">
              <strong>{{ t.name }}</strong>
              @if (t.customPrompt) {
                <mat-icon class="custom-prompt-icon" matTooltip="Has custom prompt">edit_note</mat-icon>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="difficulty">
            <th mat-header-cell *matHeaderCellDef>Difficulty</th>
            <td mat-cell *matCellDef="let t">
              <span class="diff-badge" [class]="'diff-' + t.difficulty.toLowerCase()">
                {{ t.difficulty | titlecase }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="tags">
            <th mat-header-cell *matHeaderCellDef>Tags</th>
            <td mat-cell *matCellDef="let t">
              <mat-chip-set>
                @for (tag of t.tags.slice(0, 3); track tag) {
                  <mat-chip>{{ tag.trim() }}</mat-chip>
                }
                @if (t.tags.length > 3) {
                  <mat-chip>+{{ t.tags.length - 3 }}</mat-chip>
                }
              </mat-chip-set>
            </td>
          </ng-container>

          <ng-container matColumnDef="active">
            <th mat-header-cell *matHeaderCellDef>Active</th>
            <td mat-cell *matCellDef="let t">
              <span class="active-badge" [class.inactive]="!t.active">
                {{ t.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="updatedAt">
            <th mat-header-cell *matHeaderCellDef>Updated</th>
            <td mat-cell *matCellDef="let t">{{ t.updatedAt | date:'MMM d, y' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let t">
              <div class="actions">
                <button mat-icon-button color="accent" [routerLink]="['/topics', t.id, 'edit']" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="primary" (click)="preview(t)" matTooltip="Preview tip" [disabled]="previewLoading === t.id">
                  <mat-icon>preview</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="delete(t)" matTooltip="Deactivate">
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
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    h1 { margin: 0; font-size: 1.8rem; }
    .subtitle { color: #666; margin: 4px 0 0; }

    .spinner-center { display: flex; justify-content: center; padding: 80px; }

    .empty-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px !important;
      color: #999;
      gap: 12px;
    }
    .empty-card mat-icon { font-size: 56px; width: 56px; height: 56px; }

    .full-width { width: 100%; }

    .table-row:hover { background: #f5f5f5; }

    .diff-badge {
      padding: 3px 10px;
      border-radius: 12px;
      font-size: .78rem;
      font-weight: 500;
    }
    .diff-beginner    { background: #e8f5e9; color: #2e7d32; }
    .diff-intermediate { background: #fff3e0; color: #e65100; }
    .diff-advanced    { background: #ffebee; color: #c62828; }

    .active-badge {
      padding: 3px 10px;
      border-radius: 12px;
      font-size: .78rem;
      background: #e8f5e9;
      color: #2e7d32;
    }
    .active-badge.inactive { background: #fafafa; color: #9e9e9e; }

    .custom-prompt-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      vertical-align: middle;
      margin-left: 4px;
      color: #1976d2;
    }

    .actions { display: flex; gap: 4px; }
  `],
})
export class TopicListComponent implements OnInit {
  topics: Topic[] = [];
  loading = true;
  previewLoading: number | null = null;
  columns = ['name', 'difficulty', 'tags', 'active', 'updatedAt', 'actions'];

  constructor(
    private topicSvc: TopicService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.topicSvc.getAll().subscribe({
      next: data => { this.topics = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  preview(topic: Topic) {
    this.previewLoading = topic.id;
    this.topicSvc.preview(topic.id).subscribe({
      next: tip => {
        this.previewLoading = null;
        this.dialog.open(PreviewDialogComponent, {
          data: { topic: topic.name, tip },
          width: '640px',
        });
      },
      error: () => {
        this.previewLoading = null;
        this.snackBar.open('Preview failed', 'Close', { duration: 3000 });
      },
    });
  }

  delete(topic: Topic) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Deactivate Topic', message: `Deactivate "${topic.name}"?` },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.topicSvc.delete(topic.id).subscribe({
        next: () => { this.snackBar.open('Topic deactivated', 'Close', { duration: 3000 }); this.load(); },
        error: () => this.snackBar.open('Failed to deactivate', 'Close', { duration: 3000 }),
      });
    });
  }
}

// Inline preview dialog
import { Component as Comp2, Inject as Inj2 } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Comp2({ selector: 'app-preview-dialog', standalone: true, imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Tip Preview — {{ data.topic }}</h2>
    <mat-dialog-content>
      <pre class="tip-pre">{{ data.tip }}</pre>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`.tip-pre { white-space: pre-wrap; font-family: inherit; font-size: .9rem; line-height: 1.6; }`]
})
export class PreviewDialogComponent {
  constructor(public ref: MatDialogRef<PreviewDialogComponent>, @Inj2(MAT_DIALOG_DATA) public data: any) {}
}
