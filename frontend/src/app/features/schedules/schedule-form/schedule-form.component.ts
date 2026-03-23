import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ScheduleService } from '../../../core/services/schedule.service';
import { TopicService } from '../../../core/services/topic.service';
import { TeamsChannelService } from '../../../core/services/teams-channel.service';
import { Topic } from '../../../core/models/topic.model';
import { TeamsChannel } from '../../../core/models/teams-channel.model';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Sao_Paulo', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok', 'Asia/Singapore', 'Asia/Tokyo',
  'Australia/Sydney', 'Pacific/Auckland',
];

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSlideToggleModule,
    MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="page-header">
      <button mat-icon-button routerLink="/schedules"><mat-icon>arrow_back</mat-icon></button>
      <div>
        <h1>{{ isEdit ? 'Edit Schedule' : 'New Schedule' }}</h1>
        <p class="subtitle">{{ isEdit ? 'Update schedule settings' : 'Automate tip delivery to a Teams channel' }}</p>
      </div>
    </div>

    @if (dataLoading) {
      <div class="spinner-center"><mat-spinner /></div>
    } @else {
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Schedule Name</mat-label>
              <input matInput formControlName="name" placeholder="e.g. Daily Docker Tips">
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Topic</mat-label>
                <mat-select formControlName="topicId">
                  @for (t of topics; track t.id) {
                    <mat-option [value]="t.id">{{ t.name }}</mat-option>
                  }
                </mat-select>
                @if (form.get('topicId')?.hasError('required') && form.get('topicId')?.touched) {
                  <mat-error>Topic is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Teams Channel</mat-label>
                <mat-select formControlName="channelId">
                  @for (c of channels; track c.id) {
                    <mat-option [value]="c.id">{{ c.name }}</mat-option>
                  }
                </mat-select>
                @if (form.get('channelId')?.hasError('required') && form.get('channelId')?.touched) {
                  <mat-error>Channel is required</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Timezone</mat-label>
              <mat-select formControlName="timezone">
                @for (tz of timezones; track tz) {
                  <mat-option [value]="tz">{{ tz }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="send-times-section">
              <label class="section-label">Send Times</label>
              <p class="hint">Add one or more daily times in HH:mm (24-hour) format</p>

              @for (ctrl of sendTimes.controls; track $index) {
                <div class="time-row">
                  <mat-form-field appearance="outline" class="time-field">
                    <mat-label>Time {{ $index + 1 }}</mat-label>
                    <input matInput [formControl]="$any(ctrl)" placeholder="09:00">
                    @if (ctrl.hasError('required') && ctrl.touched) {
                      <mat-error>Time is required</mat-error>
                    }
                    @if (ctrl.hasError('pattern') && ctrl.touched) {
                      <mat-error>Format must be HH:mm (e.g. 09:00)</mat-error>
                    }
                  </mat-form-field>
                  @if (sendTimes.length > 1) {
                    <button mat-icon-button color="warn" type="button" (click)="removeTime($index)">
                      <mat-icon>remove_circle_outline</mat-icon>
                    </button>
                  }
                </div>
              }

              <button mat-stroked-button type="button" (click)="addTime()">
                <mat-icon>add</mat-icon> Add Time
              </button>
            </div>

            <div class="toggle-row">
              <mat-slide-toggle formControlName="active" color="primary">Active</mat-slide-toggle>
            </div>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/schedules">Cancel</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="saving">
                @if (saving) { <mat-spinner diameter="20" /> }
                @else { {{ isEdit ? 'Save Changes' : 'Create Schedule' }} }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 1.8rem; }
    .subtitle { color: #666; margin: 4px 0 0; }
    .spinner-center { display: flex; justify-content: center; padding: 80px; }
    .form-card { max-width: 800px; border-radius: 12px !important; }
    form { display: flex; flex-direction: column; gap: 16px; }
    .form-row { display: flex; gap: 16px; }
    .flex-1 { flex: 1; }
    .full-width { width: 100%; }
    .send-times-section { display: flex; flex-direction: column; gap: 8px; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; }
    .section-label { font-weight: 500; font-size: .95rem; }
    .hint { color: #666; font-size: .85rem; margin: 0; }
    .time-row { display: flex; align-items: center; gap: 8px; }
    .time-field { width: 160px; }
    .toggle-row { padding: 4px 0; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; }
    mat-spinner { margin: 0 auto; }
  `],
})
export class ScheduleFormComponent implements OnInit {
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    topicId: [null as number | null, Validators.required],
    channelId: [null as number | null, Validators.required],
    timezone: ['UTC', Validators.required],
    sendTimes: this.fb.array([
      this.fb.control('09:00', [Validators.required, Validators.pattern(TIME_PATTERN)]),
    ]),
    active: [true],
  });

  timezones = TIMEZONES;
  topics: Topic[] = [];
  channels: TeamsChannel[] = [];
  isEdit = false;
  saving = false;
  dataLoading = true;
  private scheduleId?: number;

  get sendTimes() { return this.form.get('sendTimes') as FormArray; }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private scheduleSvc: ScheduleService,
    private topicSvc: TopicService,
    private channelSvc: TeamsChannelService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.isEdit = true; this.scheduleId = +id; }

    forkJoin({
      topics: this.topicSvc.getAll(true),
      channels: this.channelSvc.getAll(true),
    }).subscribe(({ topics, channels }) => {
      this.topics = topics;
      this.channels = channels;

      if (this.isEdit && this.scheduleId) {
        this.scheduleSvc.getById(this.scheduleId).subscribe(s => {
          while (this.sendTimes.length > 0) this.sendTimes.removeAt(0);
          s.sendTimes.forEach(t =>
            this.sendTimes.push(this.fb.control(t, [Validators.required, Validators.pattern(TIME_PATTERN)]))
          );
          this.form.patchValue({
            name: s.name,
            topicId: s.topic.id,
            channelId: s.channel.id,
            timezone: s.timezone,
            active: s.active,
          });
          this.dataLoading = false;
        });
      } else {
        this.dataLoading = false;
      }
    });
  }

  addTime() {
    this.sendTimes.push(this.fb.control('', [Validators.required, Validators.pattern(TIME_PATTERN)]));
  }

  removeTime(i: number) { this.sendTimes.removeAt(i); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.form.value;
    const req = {
      name: v.name!,
      topicId: v.topicId!,
      channelId: v.channelId!,
      sendTimes: v.sendTimes as string[],
      timezone: v.timezone!,
      active: v.active ?? true,
    };

    const obs = this.isEdit
      ? this.scheduleSvc.update(this.scheduleId!, req)
      : this.scheduleSvc.create(req);

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Schedule ${this.isEdit ? 'updated' : 'created'}`, 'Close', { duration: 3000 });
        this.router.navigate(['/schedules']);
      },
      error: err => {
        this.saving = false;
        const msg = err.error?.message ?? 'Save failed';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      },
    });
  }
}
