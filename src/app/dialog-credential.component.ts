import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dialog-credential',
  templateUrl: 'dialog-credential.html',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
})
export class DialogCredential {
  identityForm = new FormGroup({
    schema: new FormControl(''),
    did: new FormControl(''),
    tags: new FormControl(
      'World Voluntaryist Organisation, WVO, The Voluntaryist Covenant'
    ),

    name: new FormControl(''),
    birthdate: new FormControl(''),
  });
}
