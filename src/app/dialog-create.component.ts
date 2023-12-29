import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Component } from "@angular/core";
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'dialog-create',
    templateUrl: 'dialog-create.html',
    standalone: true,
    imports: [MatInputModule, MatDialogModule, MatButtonModule, MatFormFieldModule, ReactiveFormsModule],
})
export class DialogCreate {
    identityForm = new FormGroup({
        name: new FormControl(''),
        tags: new FormControl('liberstad resident, liberstad membership organisation, liberstad city council'),
    });

}
