import { Component, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface respostaEvento {
  message: string;
}

@Component({
  selector: 'app-cadastrar-evento',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cadastrar-evento.html',
})
export class CadastrarEvento {
  formularioPalestras = new FormGroup({
    titulo:          new FormControl('', Validators.required),
    descricao:       new FormControl('', Validators.required),
    nomePalestrante: new FormControl('', Validators.required),
    localEvento:     new FormControl('', Validators.required),
    dataEvento:      new FormControl('', Validators.required),
  });

  mensagem     = '';
  tipoMensagem: 'success' | 'danger' = 'success';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  onSubmit(): void {
    if (!this.formularioPalestras.valid) return;

    this.http
      .post<respostaEvento>(
        'http://localhost:3000/api/admin',
        this.formularioPalestras.value,
      )
      .subscribe({
        next: (res) => {
          this.tipoMensagem = 'success';
          this.mensagem     = res.message;
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/home']), 2000);
        },
        error: (err) => {
          this.tipoMensagem = 'danger';
          this.mensagem =
            err?.status === 400
              ? err?.error?.message || 'Erro ao cadastrar palestra'
              : err?.error?.message || 'Erro interno ao salvar os dados';
          this.cdr.detectChanges();
        },
      });
  }
}