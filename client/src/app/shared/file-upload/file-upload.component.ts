import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <input type="file" (change)="onFileSelected($event)" />
    <button mat-raised-button color="primary" (click)="upload()">Upload</button>
  `,
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  selectedFile: File | null = null;
  @Output() fileUploaded = new EventEmitter<File>();

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (this.selectedFile) {
      this.fileUploaded.emit(this.selectedFile);
    }
  }
}
