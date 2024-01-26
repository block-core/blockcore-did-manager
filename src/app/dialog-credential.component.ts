import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'dialog-credential',
  templateUrl: 'dialog-credential.html',
  standalone: true,
  imports: [
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
})
export class DialogCredential {
  identityForm = new FormGroup({
    did: new FormControl(''),
    tags: new FormControl(
      'World Voluntaryist Organisation, WVO, The Voluntaryist Covenant'
    ),
  });
}
