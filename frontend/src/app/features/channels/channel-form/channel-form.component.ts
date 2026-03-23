import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TeamsChannelService } from '../../../core/services/teams-channel.service';

@Component({
  selector: 'app-channel-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSlideToggleModule,
    MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="page-header">
      <button mat-icon-button routerLink="/channels"><mat-icon>arrow_back</mat-icon></button>
      <div>
        <h1>{{ isEdit ? 'Edit Channel' : 'New Channel' }}</h1>
        <p class="subtitle">{{ isEdit ? 'Update channel details' : 'Register a Microsoft Teams webhook' }}</p>
      </div>
    </div>

    <mat-card class="form-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Channel Name</mat-label>
            <input matInput formControlName="name" placeholder="e.g. #dev-learning">
            @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Webhook URL</mat-label>
            <input matInput formControlName="webhookUrl"
                   placeholder="https://outlook.office.com/webhook/...">
            <mat-hint>Must be a valid Microsoft Teams or Azure Logic Apps webhook URL</mat-hint>
            @if (form.get('webhookUrl')?.hasError('required') && form.get('webhookUrl')?.touched) {
              <mat-error>Webhook URL is required</mat-error>
            }
            @if (form.get('webhookUrl')?.hasError('pattern')) {
              <mat-error>Must be a valid Teams webhook URL (webhook.office.com or logic.azure.com)</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description (optional)</mat-label>
            <input matInput formControlName="description" placeholder="Brief description of this channel">
            @if (form.get('description')?.hasError('maxlength')) {
              <mat-error>Max 255 characters</mat-error>
            }
          </mat-form-field>

          <div class="toggle-row">
            <mat-slide-toggle formControlName="active" color="primary">Active</mat-slide-toggle>
          </div>

          <div class="form-actions">
            <button mat-button type="button" routerLink="/channels">Cancel</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="saving">
              @if (saving) { <mat-spinner diameter="20" /> }
              @else { {{ isEdit ? 'Save Changes' : 'Add Channel' }} }
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 1.8rem; }
    .subtitle { color: #666; margin: 4px 0 0; }
    .form-card { max-width: 700px; border-radius: 12px !important; }
    form { display: flex; flex-direction: column; gap: 16px; }
    .full-width { width: 100%; }
    .toggle-row { padding: 4px 0; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; }
    mat-spinner { margin: 0 auto; }
  `],
})
export class ChannelFormComponent implements OnInit {
  // Permissive pattern — actual validation done server-side
  private webhookPattern = /^https:\/\/(.*\.webhook\.office\.com|.*\.logic\.azure\.com)\/.+/;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    webhookUrl: ['', [Validators.required, Validators.pattern(this.webhookPattern)]],
    description: ['', Validators.maxLength(255)],
    active: [true],
  });

  isEdit = false;
  saving = false;
  private channelId?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private channelSvc: TeamsChannelService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.channelId = +id;
      this.channelSvc.getById(this.channelId).subscribe(ch => {
        this.form.patchValue({
          name: ch.name,
          webhookUrl: ch.webhookUrl,
          description: ch.description ?? '',
          active: ch.active,
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
      webhookUrl: v.webhookUrl!,
      description: v.description?.trim() || null,
      active: v.active ?? true,
    };

    const obs = this.isEdit
      ? this.channelSvc.update(this.channelId!, req)
      : this.channelSvc.create(req);

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Channel ${this.isEdit ? 'updated' : 'created'}`, 'Close', { duration: 3000 });
        this.router.navigate(['/channels']);
      },
      error: err => {
        this.saving = false;
        const msg = err.error?.message ?? 'Save failed';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      },
    });
  }
}
