import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { TitleCasePipe } from '@angular/common';
import { TopicService } from '../../../core/services/topic.service';
import { Difficulty } from '../../../core/models/topic.model';

@Component({
  selector: 'app-topic-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSlideToggleModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatExpansionModule,
    TitleCasePipe,
  ],
  template: `
    <div class="page-header">
      <button mat-icon-button routerLink="/topics"><mat-icon>arrow_back</mat-icon></button>
      <div>
        <h1>{{ isEdit ? 'Edit Topic' : 'New Topic' }}</h1>
        <p class="subtitle">{{ isEdit ? 'Update topic details' : 'Create a new learning topic' }}</p>
      </div>
    </div>

    <mat-card class="form-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-row">
            <mat-form-field appearance="outline" class="flex-2">
              <mat-label>Topic Name</mat-label>
              <input matInput formControlName="name" placeholder="e.g. Docker Fundamentals">
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <mat-error>Name is required</mat-error>
              }
              @if (form.get('name')?.hasError('maxlength')) {
                <mat-error>Max 100 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Difficulty</mat-label>
              <mat-select formControlName="difficulty">
                @for (d of difficulties; track d) {
                  <mat-option [value]="d">{{ d | titlecase }}</mat-option>
                }
              </mat-select>
              @if (form.get('difficulty')?.hasError('required') && form.get('difficulty')?.touched) {
                <mat-error>Difficulty is required</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"
                      placeholder="What will developers learn about this topic?"></textarea>
            @if (form.get('description')?.hasError('required') && form.get('description')?.touched) {
              <mat-error>Description is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Tags</mat-label>
            <input matInput formControlName="tags" placeholder="docker, containers, devops (comma-separated)">
            <mat-hint>Comma-separated tags to help categorize the topic</mat-hint>
          </mat-form-field>

          <mat-expansion-panel class="prompt-panel">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>edit_note</mat-icon>
                Custom AI Prompt (optional)
              </mat-panel-title>
              <mat-panel-description>Override the default prompt for this topic</mat-panel-description>
            </mat-expansion-panel-header>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Custom Prompt</mat-label>
              <textarea matInput formControlName="customPrompt" rows="10"
                        placeholder="Leave empty to use the default prompt..."></textarea>
              <mat-hint>
                Available placeholders: {topic}, {description}, {difficulty}, {tags}, {date}, {recentSubtopics}
              </mat-hint>
            </mat-form-field>
          </mat-expansion-panel>

          <div class="toggle-row">
            <mat-slide-toggle formControlName="active" color="primary">Active</mat-slide-toggle>
          </div>

          <div class="form-actions">
            <button mat-button type="button" routerLink="/topics">Cancel</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="saving">
              @if (saving) { <mat-spinner diameter="20" /> }
              @else { {{ isEdit ? 'Save Changes' : 'Create Topic' }} }
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 24px;
    }
    h1 { margin: 0; font-size: 1.8rem; }
    .subtitle { color: #666; margin: 4px 0 0; }

    .form-card { max-width: 800px; border-radius: 12px !important; }

    form { display: flex; flex-direction: column; gap: 16px; }

    .form-row { display: flex; gap: 16px; }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }
    .full-width { width: 100%; }

    .prompt-panel {
      border: 1px solid #e0e0e0;
      border-radius: 8px !important;
      box-shadow: none !important;
    }
    .prompt-panel mat-panel-title { display: flex; align-items: center; gap: 8px; }

    .toggle-row { padding: 4px 0; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 8px;
    }

    mat-spinner { margin: 0 auto; }
  `],
})
export class TopicFormComponent implements OnInit {
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.required],
    difficulty: ['BEGINNER' as Difficulty, Validators.required],
    tags: [''],
    customPrompt: [''],
    active: [true],
  });

  difficulties: Difficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  isEdit = false;
  saving = false;
  private topicId?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private topicSvc: TopicService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.topicId = +id;
      this.topicSvc.getById(this.topicId).subscribe(topic => {
        this.form.patchValue({
          name: topic.name,
          description: topic.description,
          difficulty: topic.difficulty,
          tags: topic.tags.join(', '),
          customPrompt: topic.customPrompt ?? '',
          active: topic.active,
        });
      });
    }
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.form.value;
    const req = {
      name: v.name!,
      description: v.description!,
      difficulty: v.difficulty!,
      tags: v.tags ?? '',
      customPrompt: v.customPrompt?.trim() || null,
      active: v.active ?? true,
    };

    const obs = this.isEdit
      ? this.topicSvc.update(this.topicId!, req)
      : this.topicSvc.create(req);

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Topic ${this.isEdit ? 'updated' : 'created'}`, 'Close', { duration: 3000 });
        this.router.navigate(['/topics']);
      },
      error: err => {
        this.saving = false;
        const msg = err.error?.message ?? 'Save failed';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      },
    });
  }
}
