import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Auth } from '../auth';
import { PalestraApi, Palestra } from '../palestra';

interface UserData {
  id: number;
  email: string;
  nome: string;
  admin: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  userData: UserData | null = null;
  palestras: Palestra[] = [];

  constructor(
    private authService: Auth,
    private palestraApi: PalestraApi,
    private router: Router,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.userData = this.authService.getUser();
    if (!this.userData) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.palestraApi.listarPalestra().subscribe({
      next: (dados) => {
        this.palestras = dados;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar palestras', err),
    });
  }

  inscricao(idPalestra: number): void {
    const idUsuario = this.userData?.id;
    if (!idUsuario) return;

    this.http
      .post<any>('http://localhost:3000/api/inscricao', { idUsuario, idPalestra })
      .subscribe({
        next:  (res) => alert(res.message),
        error: (err) => alert(err.error.message),
      });
  }
}