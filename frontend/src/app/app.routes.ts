import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'topics',
        loadComponent: () => import('./features/topics/topic-list/topic-list.component').then(m => m.TopicListComponent),
      },
      {
        path: 'topics/new',
        loadComponent: () => import('./features/topics/topic-form/topic-form.component').then(m => m.TopicFormComponent),
      },
      {
        path: 'topics/:id/edit',
        loadComponent: () => import('./features/topics/topic-form/topic-form.component').then(m => m.TopicFormComponent),
      },
      {
        path: 'channels',
        loadComponent: () => import('./features/channels/channel-list/channel-list.component').then(m => m.ChannelListComponent),
      },
      {
        path: 'channels/new',
        loadComponent: () => import('./features/channels/channel-form/channel-form.component').then(m => m.ChannelFormComponent),
      },
      {
        path: 'channels/:id/edit',
        loadComponent: () => import('./features/channels/channel-form/channel-form.component').then(m => m.ChannelFormComponent),
      },
      {
        path: 'schedules',
        loadComponent: () => import('./features/schedules/schedule-list/schedule-list.component').then(m => m.ScheduleListComponent),
      },
      {
        path: 'schedules/new',
        loadComponent: () => import('./features/schedules/schedule-form/schedule-form.component').then(m => m.ScheduleFormComponent),
      },
      {
        path: 'schedules/:id/edit',
        loadComponent: () => import('./features/schedules/schedule-form/schedule-form.component').then(m => m.ScheduleFormComponent),
      },
      {
        path: 'tip-logs',
        loadComponent: () => import('./features/tip-logs/tip-log-list/tip-log-list.component').then(m => m.TipLogListComponent),
      },
      {
        path: 'tip-logs/:id',
        loadComponent: () => import('./features/tip-logs/tip-log-detail/tip-log-detail.component').then(m => m.TipLogDetailComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
