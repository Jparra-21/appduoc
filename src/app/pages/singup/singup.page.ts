import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/authentication.service';
import { getAuth, updateProfile } from "firebase/auth";

@Component({
  selector: 'app-singup',
  templateUrl: './singup.page.html',
  styleUrls: ['./singup.page.scss'],
})
export class SingupPage implements OnInit {
  regForm: FormGroup 
  
  constructor(public formBuilder:FormBuilder, public loadingCtrl: LoadingController, public authService:AuthenticationService, public router : Router) { }

  ngOnInit() {
    this.regForm = this.formBuilder.group({
      fullname :['', [Validators.required]],
      email :['', [Validators.required, Validators.email, Validators.pattern("[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$")]],
      password : ['', [Validators.required] ]
    })
  }

  //Validators.pattern("(?=.*\d)(?=.*[a-z])(?=.*[0-8])(?=.*[A-Z]).{8,}")
  get errorControl(){
    return this.regForm?.controls;
  }

  async singUp(){
    const loading = await this.loadingCtrl.create();
    await loading.present();
    if(this.regForm?.valid){
      const user = await this.authService.registerUser(this.regForm.value.email,this.regForm.value.password).catch((error)=>{
        console.log(error);
        loading.dismiss()
      })

      if(user){
        loading.dismiss();
        this.updateUser();
        this.router.navigate(['/home'])
      }else{
        console.log('Credenciales erroneas');
        
      }
    }
  }

  async updateUser(){
    const auth = getAuth();
    await updateProfile(auth.currentUser, {displayName: this.regForm.value.fullname

    }).then(() => {
      console.log('Profile Updated');
    }).catch((error) => {
      console.log(error);
    });
  }

}
