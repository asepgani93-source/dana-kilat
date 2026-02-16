import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-merchant',
  templateUrl: './merchant.page.html',
  styleUrls: ['./merchant.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    QRCodeComponent  // ✅ INI YANG BENAR
  ]
})
export class MerchantPage {

  merchantName: string = 'Bakso Pak Kumis';
  harga: number = 0;

  qrData: string = '';

  generateQR() {
    const data = {
      merchant: this.merchantName,
      harga: this.harga
    };

    this.qrData = JSON.stringify(data);
  }
}
