import { Routes } from '@angular/router';
import { UploadComponent } from './upload.component';
import { authGuard } from '../../guards/auth.guard';

export const UPLOAD_ROUTES: Routes = [
  {
    path: '',
    component: UploadComponent,
    canActivate: [authGuard],
    title: 'Upload Financial Documents'
  }
];
