import { Component } from '@angular/core';
import { IonicModule, ToastController, AlertController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { addIcons } from 'ionicons';
import {
  flash,
  water,
  gameController,
  apps,
  scanOutline,
  notificationsOutline,
  arrowUpCircle,
  wallet,
  eyeOutline,
  eyeOffOutline,
  addCircleOutline,
  paperPlaneOutline,
  cardOutline,
  giftOutline,
  chevronForwardOutline,
  receiptOutline
} from 'ionicons/icons';

interface Transaction {
  merchant: string;
  nominal: number;
  waktu: string;
}

interface Menu {
  icon: string;
  label: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HomePage {

  saldo = 1250000;
  history: Transaction[] = [];
  isSaldoHidden = false;

  menus: Menu[] = [
    { icon: 'flash', label: 'Pulsa' },
    { icon: 'water', label: 'PDAM' },
    { icon: 'game-controller', label: 'Voucher' },
    { icon: 'apps', label: 'Lainnya' },
  ];

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({
      flash,
      water,
      gameController,
      apps,
      scanOutline,
      notificationsOutline,
      arrowUpCircle,
      wallet,
      eyeOutline,
      eyeOffOutline,
      addCircleOutline,
      paperPlaneOutline,
      cardOutline,
      giftOutline,
      chevronForwardOutline,
      receiptOutline
    });
  }

  /* ==============================
     UTILITIES
  ============================== */

  formatCurrency(value: number): string {
    return value.toLocaleString('id-ID');
  }

  sanitize(text: string): string {
    return text.replace(/[<>]/g, '');
  }

  async showLoading(message: string) {
    const loading = await this.loadingCtrl.create({ message });
    await loading.present();
    return loading;
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color
    });
    await toast.present();
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  /* ==============================
     SALDO
  ============================== */

  toggleSaldoVisibility() {
    this.isSaldoHidden = !this.isSaldoHidden;
  }

  async isiSaldo() {
    const alert = await this.alertCtrl.create({
      header: 'Top Up Saldo',
      inputs: [50000, 100000, 200000, 500000, 1000000].map((value, i) => ({
        type: 'radio',
        label: `Rp ${this.formatCurrency(value)}`,
        value,
        checked: i === 0
      })),
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Top Up',
          handler: (value) => value && this.processTopUp(value)
        }
      ]
    });

    await alert.present();
  }

  async kirimUang() {
  this.showToast('Fitur kirim uang segera hadir');
}

async tarikSaldo() {
  this.showToast('Fitur tarik saldo segera hadir');
}

  async processTopUp(amount: number) {
    const loading = await this.showLoading('Memproses top up...');
    await this.delay(1200);

    this.saldo += amount;

    await loading.dismiss();
    this.showToast(`Saldo berhasil ditambahkan Rp ${this.formatCurrency(amount)}`, 'success');
  }

  /* ==============================
     QR SCANNER
  ============================== */

  async scanQR() {
    try {
      const supported = await BarcodeScanner.isSupported();
      if (!supported.supported) {
        return this.showAlert('Error', 'Device tidak mendukung scanner.');
      }

      const permission = await BarcodeScanner.requestPermissions();
      if (permission.camera !== 'granted') {
        return this.showAlert('Izin Kamera', 'Aktifkan izin kamera di pengaturan aplikasi.');
      }

      document.body.classList.add('barcode-scanner-active');

      const result = await BarcodeScanner.scan();

      document.body.classList.remove('barcode-scanner-active');

      if (!result.barcodes?.length) {
        return this.showToast('QR tidak terdeteksi', 'warning');
      }

      const qrData = result.barcodes[0].rawValue;
      if (!qrData) return;

      await this.processQRData(qrData);

    } catch (error) {
      document.body.classList.remove('barcode-scanner-active');
      this.showToast('Scan gagal', 'danger');
    }
  }

  async processQRData(qrData: string) {
    try {
      const data = JSON.parse(qrData);
      if (data.merchant && data.harga) {
        return this.confirmPayment(data.merchant, Number(data.harga));
      }
      throw new Error();
    } catch {
      return this.confirmPayment(qrData, 15000);
    }
  }

  /* ==============================
     PAYMENT
  ============================== */
  async confirmPayment(merchant: string, amount: number) {

    const safeMerchant = this.sanitize(merchant);
    const formattedAmount = this.formatCurrency(amount);

    const alert = await this.alertCtrl.create({
      header: 'Konfirmasi Pembayaran',
      subHeader: safeMerchant,
      message: `Jumlah pembayaran\nRp ${formattedAmount}`,
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Bayar',
          handler: () => this.processPayment(merchant, amount)
        }
      ]
    });

    await alert.present();
  }

  async processPayment(merchant: string, amount: number) {

    if (this.saldo < amount) {
      return this.showAlert(
        'Saldo Tidak Cukup',
        'Silakan lakukan top up terlebih dahulu.'
      );
    }

    const loading = await this.showLoading('Memproses pembayaran...');
    await this.delay(1500);

    this.saldo -= amount;

    this.history.unshift({
      merchant,
      nominal: amount,
      waktu: new Date().toLocaleString('id-ID')
    });

    await loading.dismiss();
    this.showToast(`Pembayaran berhasil ke ${merchant}`, 'success');
  }

  /* ==============================
     MISC
  ============================== */

  onMenuClick(label: string) {
    this.showToast(`Fitur ${label} segera hadir`);
  }

  openNotifications() {
    this.showToast('Fitur notifikasi segera hadir');
  }

  openPromo() {
    this.showToast('Fitur promo segera hadir');
  }

  viewAllTransactions() {
    this.showToast('Fitur riwayat lengkap segera hadir');
  }

  viewTransactionDetail(transaction: Transaction) {
    this.showToast(`Detail transaksi: ${transaction.merchant}`);
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
