import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/finance.service';
import { Transaction, MonthlySummary, YearlySummary } from '../../models/transaction.model';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>Finance Dashboard</h1>
     
      <div class="dashboard-content">
        <!-- Summary Cards -->
        <div class="summary-cards" *ngIf="monthlySummary">
          <div class="card">
            <h3>Total Income</h3>
            <p class="amount income">\${{ monthlySummary.total_income | number:'1.2-2' }}</p>
          </div>
          <div class="card">
            <h3>Total Expenses</h3>
            <p class="amount expense">\${{ monthlySummary.total_expense | number:'1.2-2' }}</p>
          </div>
          <div class="card">
            <h3>Total Investment</h3>
            <p class="amount investment">\${{ monthlySummary.total_investment | number:'1.2-2' }}</p>
          </div>
          <div class="card">
            <h3>Net Savings</h3>
            <p class="amount" [class.income]="monthlySummary.net_savings >= 0" [class.expense]="monthlySummary.net_savings < 0">
              \${{ monthlySummary.net_savings | number:'1.2-2' }}
            </p>
          </div>
        </div>


        <!-- Charts Section - Simple Pie Charts -->
        <div class="charts-section">
          <!-- Transaction Types Chart -->
          <div class="chart-container">
            <h3>Transaction Types Distribution</h3>
            <div class="pie-chart" *ngIf="transactionTypesData">
              <div class="pie-segment income"
                   [style.transform]="'rotate(' + transactionTypesData.incomeRotation + 'deg)'"
                   [style.stroke-dasharray]="transactionTypesData.incomeStroke + ' 314'">
              </div>
              <div class="pie-segment expense"
                   [style.transform]="'rotate(' + transactionTypesData.expenseRotation + 'deg)'"
                   [style.stroke-dasharray]="transactionTypesData.expenseStroke + ' 314'">
              </div>
              <div class="pie-segment investment"
                   [style.transform]="'rotate(' + transactionTypesData.investmentRotation + 'deg)'"
                   [style.stroke-dasharray]="transactionTypesData.investmentStroke + ' 314'">
              </div>
              <div class="pie-legend">
                <div class="legend-item">
                  <span class="legend-color income"></span>
                  <span>Income: \${{ monthlySummary?.total_income | number:'1.0-0' }}</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color expense"></span>
                  <span>Expenses: \${{ monthlySummary?.total_expense | number:'1.0-0' }}</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color investment"></span>
                  <span>Investment: \${{ monthlySummary?.total_investment | number:'1.0-0' }}</span>
                </div>
              </div>
            </div>
          </div>


          <!-- Expense Categories Chart -->
          <div class="chart-container" *ngIf="expenseCategoriesData && expenseCategoriesData.length > 0">
            <h3>Expense Categories</h3>
            <div class="category-bars">
              <div class="category-item" *ngFor="let item of expenseCategoriesData">
                <div class="category-info">
                  <span class="category-name">{{ item.category }}</span>
                  <span class="category-amount">\${{ item.amount | number:'1.0-0' }}</span>
                </div>
                <div class="category-bar">
                  <div class="category-fill" [style.width.%]="item.percentage" [style.background-color]="item.color"></div>
                </div>
              </div>
            </div>
          </div>


          <!-- Monthly Summary -->
          <div class="chart-container" *ngIf="monthlyTrendsData && monthlyTrendsData.length > 0">
            <h3>Monthly Expenses Trend</h3>
            <div class="trend-chart">
              <div class="trend-item" *ngFor="let month of monthlyTrendsData">
                <div class="month-label">{{ month.month }}</div>
                <div class="trend-bar">
                  <div class="trend-fill"
                       [style.height.%]="month.percentage"
                       [style.background-color]="'#f44336'">
                  </div>
                </div>
                <div class="month-amount">\${{ month.amount | number:'1.0-0' }}</div>
              </div>
            </div>
          </div>
        </div>


        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading">
          <p>Loading dashboard data...</p>
        </div>


        <!-- Error State -->
        <div *ngIf="errorMessage" class="error">
          <p>{{ errorMessage }}</p>
          <button (click)="loadDashboardData()">Retry</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
   
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
   
    .card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
   
    .card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
    }
   
    .amount {
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    }
   
    .amount.income {
      color: #4CAF50;
    }
   
    .amount.expense {
      color: #f44336;
    }
   
    .amount.investment {
      color: #2196F3;
    }
   
    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 30px;
    }
   
    .chart-container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
   
    .chart-container h3 {
      margin: 0 0 20px 0;
      text-align: center;
      color: #333;
    }
   
    .pie-chart {
      position: relative;
      width: 200px;
      height: 200px;
      margin: 0 auto 20px;
      border-radius: 50%;
      background: conic-gradient(
        #4CAF50 0deg var(--income-deg, 120deg),
        #f44336 var(--income-deg, 120deg) var(--expense-deg, 240deg),
        #2196F3 var(--expense-deg, 240deg) 360deg
      );
    }
   
    .pie-legend {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
   
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
   
    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 2px;
    }
   
    .legend-color.income {
      background-color: #4CAF50;
    }
   
    .legend-color.expense {
      background-color: #f44336;
    }
   
    .legend-color.investment {
      background-color: #2196F3;
    }
   
    .category-bars {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
   
    .category-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
   
    .category-info {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }
   
    .category-name {
      font-weight: 500;
    }
   
    .category-amount {
      color: #666;
    }
   
    .category-bar {
      height: 20px;
      background-color: #f0f0f0;
      border-radius: 10px;
      overflow: hidden;
    }
   
    .category-fill {
      height: 100%;
      transition: width 0.3s ease;
    }
   
    .trend-chart {
      display: flex;
      justify-content: space-around;
      align-items: end;
      height: 200px;
      gap: 10px;
    }
   
    .trend-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }
   
    .month-label {
      font-size: 12px;
      margin-bottom: 10px;
      color: #666;
    }
   
    .trend-bar {
      width: 30px;
      height: 150px;
      background-color: #f0f0f0;
      border-radius: 15px;
      overflow: hidden;
      display: flex;
      align-items: end;
    }
   
    .trend-fill {
      width: 100%;
      border-radius: 15px 15px 0 0;
      transition: height 0.3s ease;
    }
   
    .month-amount {
      font-size: 11px;
      margin-top: 5px;
      color: #333;
    }
   
    .loading, .error {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
   
    .error button {
      margin-top: 10px;
      padding: 8px 16px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
   
    .error button:hover {
      background: #1976D2;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  monthlySummary: MonthlySummary | null = null;
  transactions: Transaction[] = [];
  isLoading = true;
  errorMessage = '';
  private subscriptions = new Subscription();


  // Data for custom charts
  transactionTypesData: any = null;
  expenseCategoriesData: any[] = [];
  monthlyTrendsData: any[] = [];


  constructor(private financeService: FinanceService) {}


  ngOnInit() {
    this.loadDashboardData();
  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }


  loadDashboardData() {
    this.isLoading = true;
    this.errorMessage = '';
   
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear()-1;
    const currentMonth = 1;


    // Load current month summary
    const monthlySummary$ = this.financeService.getMonthlySummary(currentYear, currentMonth);
   
    // Load recent transactions
    const transactions$ = this.financeService.getTransactions(0, 100);


    // Load yearly data for trends
    const yearlySummary$ = this.financeService.getYearlySummary(currentYear);


    this.subscriptions.add(
      monthlySummary$.subscribe({
        next: (summary) => {
          this.monthlySummary = summary;
          this.createTransactionTypesData(summary);
          this.createExpenseCategoriesData(summary);
        },
        error: (error) => {
          console.error('Error loading monthly summary:', error);
          this.errorMessage = 'Failed to load monthly summary. Please try again.';
        }
      })
    );


    this.subscriptions.add(
      transactions$.subscribe({
        next: (transactions) => {
          this.transactions = transactions;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
          this.errorMessage = 'Failed to load transactions. Please try again.';
          this.isLoading = false;
        }
      })
    );


    this.subscriptions.add(
      yearlySummary$.subscribe({
        next: (yearlySummary) => {
          this.createMonthlyTrendsData(yearlySummary);
        },
        error: (error) => {
          console.error('Error loading yearly summary:', error);
        }
      })
    );
  }


  private createTransactionTypesData(summary: MonthlySummary) {
    const total = summary.total_income + summary.total_expense + summary.total_investment;
   
    if (total > 0) {
      const incomePercent = (summary.total_income / total) * 100;
      const expensePercent = (summary.total_expense / total) * 100;
      const investmentPercent = (summary.total_investment / total) * 100;
     
      this.transactionTypesData = {
        incomePercent,
        expensePercent,
        investmentPercent,
        incomeRotation: 0,
        expenseRotation: (incomePercent / 100) * 360,
        investmentRotation: ((incomePercent + expensePercent) / 100) * 360,
        incomeStroke: (incomePercent / 100) * 314,
        expenseStroke: (expensePercent / 100) * 314,
        investmentStroke: (investmentPercent / 100) * 314
      };
    }
  }


  private createExpenseCategoriesData(summary: MonthlySummary) {
    if (!summary.expense_by_category || Object.keys(summary.expense_by_category).length === 0) {
      return;
    }


    const categories = Object.entries(summary.expense_by_category);
    const maxAmount = Math.max(...Object.values(summary.expense_by_category));
    const colors = this.generateColors(categories.length);
   
    this.expenseCategoriesData = categories.map(([category, amount], index) => ({
      category,
      amount,
      percentage: (amount / maxAmount) * 100,
      color: colors[index]
    }));
  }


  private createMonthlyTrendsData(yearlySummary: YearlySummary) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth() + 1;
   
    // Get last 6 months data
    const last6Months = [];
    const monthlyData = yearlySummary.monthly_data;
   
    for (let i = 5; i >= 0; i--) {
      let month = currentMonth - i;
      let year = new Date().getFullYear();
     
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
     
      const monthData = monthlyData[month];
      if (monthData) {
        last6Months.push({
          month: monthNames[month - 1],
          amount: monthData.expense
        });
      }
    }
   
    if (last6Months.length > 0) {
      const maxAmount = Math.max(...last6Months.map(m => m.amount));
     
      this.monthlyTrendsData = last6Months.map(month => ({
        ...month,
        percentage: (month.amount / maxAmount) * 100
      }));
    }
  }


  private generateColors(count: number): string[] {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
      '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
    ];
   
    return colors.slice(0, count);
  }
}
