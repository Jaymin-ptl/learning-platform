import { Component, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatTooltipModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="brand">
          <mat-icon>school</mat-icon>
          <span>Learning Platform</span>
        </div>
        <mat-nav-list>
          @for (item of navItems; track item.route) {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="active-link">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span class="spacer"></span>
          <span class="user-info">
            <mat-icon>account_circle</mat-icon>
            {{ username() }}
            <span class="role-badge">{{ role() }}</span>
          </span>
          <button mat-icon-button (click)="logout()" matTooltip="Logout">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <div class="content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }

    .sidenav {
      width: 220px;
      background: #1a237e;
      color: white;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 16px;
      font-size: 1rem;
      font-weight: 500;
      color: white;
      border-bottom: 1px solid rgba(255,255,255,.15);
    }

    mat-nav-list a {
      color: rgba(255,255,255,.85);
      border-radius: 0 24px 24px 0;
      margin: 2px 8px 2px 0;
    }

    mat-nav-list a:hover { background: rgba(255,255,255,.1); }

    .active-link {
      background: rgba(255,255,255,.2) !important;
      color: white !important;
      font-weight: 500;
    }

    .spacer { flex: 1; }

    .user-info {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: .9rem;
    }

    .role-badge {
      background: rgba(255,255,255,.25);
      border-radius: 12px;
      padding: 2px 8px;
      font-size: .75rem;
      text-transform: uppercase;
    }

    .content { padding: 24px; }
  `],
})
export class LayoutComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard',  icon: 'dashboard',     route: '/dashboard' },
    { label: 'Topics',     icon: 'topic',          route: '/topics' },
    { label: 'Channels',   icon: 'chat',           route: '/channels' },
    { label: 'Schedules',  icon: 'schedule',       route: '/schedules' },
    { label: 'Tip Logs',   icon: 'history',        route: '/tip-logs' },
  ];

  username = computed(() => this.auth.currentUser()?.username ?? '');
  role = computed(() => this.auth.currentUser()?.role ?? '');

  constructor(private auth: AuthService, private router: Router) {}

  logout() { this.auth.logout(); }
}
