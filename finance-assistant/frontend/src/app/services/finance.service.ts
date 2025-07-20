import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MonthlySummary, Transaction, TransactionCreate, YearlySummary } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private apiUrl = `${environment.apiUrl}/finance`;
  
  constructor(private http: HttpClient) { }

  // Get all transactions
  getTransactions(skip: number = 0, limit: number = 100): Observable<Transaction[]> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`, { params });
  }

  // Create a new transaction
  createTransaction(transaction: TransactionCreate): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, transaction);
  }

  // Get monthly summary
  getMonthlySummary(year: number, month: number): Observable<MonthlySummary> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    
    return this.http.get<MonthlySummary>(`${this.apiUrl}/monthly-summary`, { params });
  }

  // Get yearly summary
  getYearlySummary(year: number): Observable<YearlySummary> {
    const params = new HttpParams()
      .set('year', year.toString());
    
    return this.http.get<YearlySummary>(`${this.apiUrl}/yearly-summary`, { params });
  }
}
