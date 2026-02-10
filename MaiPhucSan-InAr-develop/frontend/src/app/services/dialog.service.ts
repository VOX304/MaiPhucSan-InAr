import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private matDialog: MatDialog) {}

  async confirm(data: ConfirmDialogData): Promise<boolean> {
    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: false,
      data
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    return result === true;
  }
}
