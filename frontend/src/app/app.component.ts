import { Component, signal, OnInit } from '@angular/core';
import {
  RouterOutlet, RouterLink, RouterLinkActive,
  Router, NavigationEnd,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Auth } from './auth';

interface UserData {
  id: number;
  email: string;
  nome: string;
  admin: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  protected readonly title = signal('sistemaPalestras');
  userData: UserData | null = null;
  logado = false;

  constructor(private router: Router, private authService: Auth) {}

  ngOnInit(): void {
    this.logado   = this.authService.isLoggedIn();
    this.userData = this.authService.getUser();

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.logado   = this.authService.isLoggedIn();
        this.userData = this.authService.getUser();
      });
  }

  logout(): void {
    this.authService.logout();
    this.logado   = false;
    this.userData = null;
  }
}