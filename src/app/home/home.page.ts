import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { getAuth, updateProfile } from "firebase/auth";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  user:any
  homeForm: FormGroup 
  constructor(public route:Router, public authService:AuthenticationService, public formBuilder:FormBuilder) {
    this.authService.isLoggedIn().subscribe(user => {
      this.user = user;
    })
    this.user = authService.getProfile
    console.log(this.user.fullname);
    console.log(this.user.email);

    
    }

    ngOnInit(){
      this.user = this.authService.getProfile
      this.homeForm = this.formBuilder.group({
        fullname :['', [Validators.required]]
      })
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
}