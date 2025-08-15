import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UploadService } from '../../services/upload.service';


@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="upload-container">
      <h1>Upload Financial Documents</h1>
      <div class="upload-content">
        <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="file">Select File</label>
            <input type="file" id="file" formControlName="file" (change)="onFileChange($event)">
          </div>
          <button type="submit" [disabled]="!selectedFile">Upload</button>
        </form>
        <div *ngIf="uploadStatus" class="status-message">
          {{ uploadStatus }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      padding: 20px;
    }
    .upload-content {
      margin-top: 20px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .status-message {
      margin-top: 15px;
      padding: 10px;
      background-color: #f0f0f0;
      border-radius: 4px;
    }
  `]
})
export class UploadComponent {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  uploadStatus: string = '';


  constructor(
    private fb: FormBuilder,
    private uploadService: UploadService
  ) {
    this.uploadForm = this.fb.group({
      file: [null, Validators.required]
    });
  }


  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      // Update the form control value
      this.uploadForm.patchValue({
        file: this.selectedFile
      });
      this.uploadForm.get('file')?.markAsTouched();
    }
  }


  onSubmit() {
    if (this.selectedFile) {
      this.uploadStatus = 'Uploading...';
      this.uploadService.uploadBankStatement(this.selectedFile).subscribe({
        next: (response: any) => {
          this.uploadStatus = 'File uploaded successfully!';
          // Reset form after successful upload
          this.uploadForm.reset();
          this.selectedFile = null;
        },
        error: (error: any) => {
          this.uploadStatus = `Upload failed: ${error.message}`;
        }
      });
    }
  }
}