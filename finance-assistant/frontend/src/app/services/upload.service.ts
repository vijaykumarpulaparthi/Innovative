import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = `${environment.apiUrl}/upload`;
  
  constructor(private http: HttpClient) { }

  // Upload bank statement PDF
  uploadBankStatement(file: File): Observable<Transaction[]> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<Transaction[]>(`${this.apiUrl}/bank-statement`, formData);
  }
}
