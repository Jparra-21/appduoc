import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { AngularFireAuth} from '@angular/fire/compat/auth';
import { User } from 'firebase/auth'

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  user:any
  constructor(public ngFireAuth: AngularFireAuth) { }

  async registerUser(email:string, password:string){
    try{
      return await this.ngFireAuth.createUserWithEmailAndPassword(email,password)
    }
    catch(error){
      console.log('Error -> ',error);
      return null;
    }
  }

  async loginUser(email:string, password:string){
      this.user = await this.ngFireAuth.signInWithEmailAndPassword(email,password)
      console.log(this.user);
      return await this.user;
  }

  async resetPassword(email:string){
    
    try {
      return await this.ngFireAuth.sendPasswordResetEmail(email)
    }
    catch(error){
      console.log('Error -> ',error);
      return null;
    }
  }

  async singOut(){
    try {
      return await this.ngFireAuth.signOut()
    }
    catch(error){
      console.log('Error -> ',error);
      return null;
    }
  }

  async getProfile(){
      return new Promise<User | null>((resolve, reject )=>{
        this.ngFireAuth.onAuthStateChanged(user =>{
          if(user){
            resolve(user)
          }else{
            resolve(null)
          }
        },reject)
      })
  }

  isLoggedIn() {
    return this.ngFireAuth.user;
  }

}
