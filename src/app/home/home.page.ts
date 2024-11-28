import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { getAuth, updateProfile } from "firebase/auth";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import html2canvas from 'html2canvas';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { AlertController, IonLoading, LoadingController, ModalController, Platform, ToastController } from '@ionic/angular';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';
import { LensFacing, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Clipboard } from '@capacitor/clipboard';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  user:any
  homeForm: FormGroup
  segment = 'scan';
  qrText = ''

  scanResult = 'https://www.duoc.cl/';
  
  constructor(
    public route:Router, 
    public authService:AuthenticationService, 
    public formBuilder:FormBuilder, 
    private loadingController: LoadingController, 
    private platform:Platform, 
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController) {
    this.authService.isLoggedIn().subscribe(user => {
      this.user = user;
    })
    this.user = authService.getProfile
    console.log(this.user.fullname);
    console.log(this.user.email);
    }

    async startScan() {
      const modal = await this.modalController.create({
      component: BarcodeScanningModalComponent,
      cssClass: 'barcode-scanning-modal',
      showBackdrop: false,
      componentProps: { 
        formats: [],
        LensFacing: LensFacing.Back
       }
      });
    
      await modal.present();

      const { data } = await modal.onWillDismiss();
      
      if(data){
        this.scanResult = data?.barcode?.displayValue;
      }
    
    }

    ngOnInit(){
      
      this.user = this.authService.getProfile
      this.homeForm = this.formBuilder.group({
        fullname :['', [Validators.required]]
      })

      if(this.platform.is('capacitor')){
        
        BarcodeScanner.isSupported().then();
        BarcodeScanner.checkPermissions().then();
        BarcodeScanner.removeAllListeners();
      }
    }  
  
    async logout(){
    this.authService.singOut().then(()=>{
      this.route.navigate(['/login'])
    }).catch((error)=>{
      console.log(error);
      
    })
  }

  async updateUser(){
    const auth = getAuth();
    await updateProfile(auth.currentUser, {displayName: this.homeForm.value.fullname

    }).then(() => {
      console.log('Profile Updated');
    }).catch((error) => {
      console.log(error);
    });
  }

  captureScreen(){

    const element = document.getElementById('qrImage') as HTMLElement;

    html2canvas(element).then((canvas: HTMLCanvasElement) => {
      
      if(this.platform.is('capacitor')) this.shareImage(canvas);
      else this.downloadImage(canvas);
    })

  }

  downloadImage(canvas: HTMLCanvasElement){
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'qr.png';
    link.click();
  }

  
async shareImage(canvas: HTMLCanvasElement){
  let base64 = canvas.toDataURL();
  let path = 'qr.png';


    const loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await loading.present();

  await Filesystem.writeFile({
    path,
    data: base64,
    directory: Directory.Cache,
  }).then(async (res) => {

    let uri = res.uri;
    await Share.share({url: uri,});

    await Filesystem.deleteFile({
      path,
      directory: Directory.Cache
    })

  }).finally(() =>{
    loading.dismiss();
  })
    
  }

  async readBarCodeFromImage(){
      const {files} = await FilePicker.pickImages();

      const path = files[0]?.path;

      if(!path) return;

     const { barcodes } = await BarcodeScanner.readBarcodesFromImage({
        path,
        formats: []
      })

      this.scanResult = barcodes[0].displayValue;
  }

  

 writeToClipboard = async () => {
  await Clipboard.write({
    string: this.scanResult
  });

  
    const toast = await this.toastController.create({
      message: 'Copiado a portapapeles',
      duration: 1000,
      color: 'terciary',
      icon: 'clipboard-outline',
      position: 'middle'
    });
    
    toast.present();
  };

  isUrl(){
    let regex = /\.(com|net|io|me|crypto|ai)\b/i;
    return regex.test(this.scanResult);
  };

 openCapacitorSite = async () => {
  
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: '¿Quieres abrir este enlace?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        }, {
          text: 'Okay',
          handler: async() => {
            let url = this.scanResult;

              if(!['https://'].includes(this.scanResult)) url = 'https://' + this.scanResult 
  
              await Browser.open({ url });
          }
        }
      ]
    });
  
    await alert.present();

  
};
}