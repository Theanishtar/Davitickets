import { RegisterService } from './../service/register.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { LoginService } from '../service/login.service';
import { delay, catchError, tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { ValidatorService } from '../service/validator.service';
//Xử lí bất đồng bộ
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import '../../assets/toast/main.js';
import { data, error } from 'jquery';

import { SocialAuthService } from '@abacritt/angularx-social-login';
import { ActivatedRoute } from '@angular/router';

declare var toast: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [`./login.component.css`],
})
export class LoginComponent {
  public loginForm!: FormGroup;
  public registerForm!: FormGroup;
  public verificationForm!: FormGroup;
  public checkForm = true;
  submitted: boolean = false;
  check: number = 0;
  checkLoginFail: number = 0;
  checkedRemember: boolean = false;
  orderby: any;

  constructor(
    private formbuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private location: Location,
    public loginService: LoginService,
    public registerService: RegisterService,
    private cookieService: CookieService,
    private validatorService: ValidatorService,
    public authService: SocialAuthService,
    private route: ActivatedRoute,
    private httpClient: HttpClient
  ) {
    this.createFormLogin();
    this.createFormRegister();
    this.createVerification();
    // this.ngOnInit();
  }

  userGG: any;
  loggedIn: any;
  ngOnInit() {


    this.route.queryParams.subscribe(params => {
      this.orderby = params['sid'];

      function delay(ms: number) {
        return new Promise(function (resolve) {
          setTimeout(resolve, ms);
        });
      }

      if (this.orderby !== undefined) {
        this.loginService.loginAuth(this.orderby).subscribe((res) => {
          console.log(res);
          if(res !== undefined){
            var userRes = {"email":res.email, "password": res.password };
            this.loginService.log(userRes).subscribe((resp) => {
              console.log(resp)
              this.cookieService.set('full_name', resp.user.full_name);
              this.cookieService.set('userid', resp.user.userid);
              this.cookieService.set('isUserLoggedIn',resp.user.sessionID);
                this.router.navigate(['home']);
                new toast({
                  title: 'Thành công!',
                  message: 'Đăng nhập thành công',
                  type: 'success',
                  duration: 1500,
                });
                delay(1500).then((_) => {
                  location.reload();
                });
            });
          }
        });} 
    });


  }


  createFormLogin() {
    this.loginForm = this.formbuilder.group({
      full_name: [''],
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      user_password: ['', Validators.required],
    });
  }

  get loginFormControl() {
    return this.loginForm.controls;
  }
  bulk(e) {
    if (e.target.checked == true) {
      this.checkedRemember = true;
    } else {
      this.checkedRemember = false;
    }
  }
  loginWithEmailAndPassword() {
    this.submitted = true;
    if (this.loginForm.valid) {
      this.loginService.loginUser(this.loginForm.value).subscribe((res) => {
        function delay(ms: number) {
          return new Promise(function (resolve) {
            setTimeout(resolve, ms);
          });
        }
        if (res == '') {
          this.checkLoginFail++
          new toast({
            title: 'Thất bại!',
            message: 'Email hoặc mật khẩu không đúng!',
            type: 'error',
            duration: 5000,
          });
          // if(this.checkLoginFail === 5){
          //   new toast({
          //     title: 'Thông báo!',
          //     message: 'Vui lòng quay lại trong 1 phút',
          //     type: 'warning',
          //     duration: 5000,
          //   });
          //   this.checkLoginFail = 0;
          // }
        } else {
          this.cookieService.set('full_name', res.user.full_name);
          this.cookieService.set('userid', res.user.userid);
          this.cookieService.set(
            'isUserLoggedIn',
            JSON.stringify(res.sesionId)
          );
          this.cookieService.set('userid', res.user.userid);
          if (this.checkedRemember == true && res.user.user_role == false) {
            this.setCookie('sessionID', res.user.sesionId, 2);
          }
          if (res.user.user_role == true) {
            window.location.href = 'http://localhost:8080/';
          } else {
            delay(500).then((res) => {
              this.loginForm.reset();
              this.router.navigate(['home']);
              new toast({
                title: 'Thành công!',
                message: 'Đăng nhập thành công',
                type: 'success',
                duration: 1500,
              });
              delay(1500).then((_) => {
                location.reload();
              });
            });
          }
        }
        
      });
    } else {
      return;
    }
  }
  setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
  }

  isLogin() {
    return this.loginService.isLogin();
  }

  /*==========================*/
  createFormRegister() {
    this.registerForm = this.formbuilder.group({
      full_name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      user_password: ['', Validators.required],
    });
  }

  get registerFormControl() {
    return this.registerForm.controls;
  }
  register() {
    this.submitted = true;
    if (this.registerForm.valid) {
      this.registerService
        .registerUser(this.registerForm.value)
        .subscribe((res) => {
          function delay(ms: number) {
            return new Promise(function (resolve) {
              setTimeout(resolve, ms);
            });
          }
          if (res == '') {
            new toast({
              title: 'Thất bại!',
              message: 'Tài khoản đã tồn tại!',
              type: 'error',
              duration: 3000,
            });
          } else {
            this.checkForm = false;
          }

          // else {
          //   Swal.fire({
          //     title:
          //       "<h2 style='color:red; font-size=10px'>Bạn có muốn đăng nhập với tài khoản " +
          //       this.registerForm.value.full_name +
          //       ' không?</h2>',
          //     showCancelButton: true,
          //     confirmButtonColor: '#d33',
          //     cancelButtonColor: '#3085d6',
          //     confirmButtonText: 'Có',
          //     cancelButtonText: 'Không',
          //     allowOutsideClick: false,
          //   }).then((result) => {
          //     if (result.value) {
          //       this.registerService.registerAndLogin().subscribe((res) => {
          //         this.cookieService.set('full_name', res.user.full_name);
          //         this.cookieService.set(
          //           'isUserLoggedIn',
          //           JSON.stringify(res.sesionId)
          //         );
          //         Swal.fire({
          //           title:
          //             '<h1 style="color: red; font-size:20px;font-weight: bold;">Đăng nhập thành công</h1>',
          //           icon: 'success',
          //           showConfirmButton: false,
          //           allowOutsideClick: false,
          //           timer: 3000,
          //         });
          //         delay(2000).then((res) => {
          //           this.loginForm.reset();
          //           this.router.navigate(['home']);
          //           delay(1).then((_) => {
          //             location.reload();
          //           });
          //         });
          //       });
          //     } else {
          //       // Swal.fire({
          //       //   title:
          //       //     '<h1 style="color: red; font-size:20px;font-weight: bold;">Đăng ký thành công</h1>',
          //       //   icon: 'success',
          //       //   showConfirmButton: false,
          //       //   allowOutsideClick: false,
          //       //   timer: 3000,
          //       // });
          //       new toast({
          //           title: 'Thành công!',
          //           message: 'Đăng ký thành công',
          //           type: 'success',
          //           duration: 3000,
          //       });
          //       window.location.href = '#loginForm';
          //     }
          //   });
          // }
        });
    } else {
      return;
    }
  }

  createVerification() {
    this.verificationForm = this.formbuilder.group({
      maxn: ['', Validators.required]
    });
  }
  get verificationFormControl() {
    return this.verificationForm.controls;
  }
  checkCodeMail() {
    this.registerService
      .checkCodeMail(this.verificationForm.value)
      .subscribe((res) => {
        function delay(ms: number) {
          return new Promise(function (resolve) {
            setTimeout(resolve, ms);
          });
        }
        alert(res)
        if (res.sessionID == "success") {
          Swal.fire({
            title:
              "<h2 style='color:red; font-size=10px'>Bạn có muốn đăng nhập với tài khoản " +
              this.registerForm.value.full_name +
              ' không?</h2>',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Có',
            cancelButtonText: 'Không',
            allowOutsideClick: false,
          }).then((result) => {
            if (result.value) {
              this.registerService.registerAndLogin().subscribe((res) => {
                this.cookieService.set('full_name', res.user.full_name);
                this.cookieService.set(
                  'isUserLoggedIn',
                  JSON.stringify(res.sesionId)
                );
                Swal.fire({
                  title:
                    '<h1 style="color: red; font-size:20px;font-weight: bold;">Đăng nhập thành công</h1>',
                  icon: 'success',
                  showConfirmButton: false,
                  allowOutsideClick: false,
                  timer: 3000,
                });
                delay(2000).then((res) => {
                  this.loginForm.reset();
                  this.router.navigate(['home']);
                  delay(1).then((_) => {
                    location.reload();
                  });
                });
              });
            } else {
              new toast({
                title: 'Thành công!',
                message: 'Đăng ký thành công',
                type: 'success',
                duration: 3000,
              });
              window.location.href = '#loginForm';
            }
          });
        } else if (res == 'errorPass') {
          new toast({
            title: 'Thất bại!',
            message: 'Mã xác nhận sai',
            type: 'error',
            duration: 3000,
          });
        } else {
          new toast({
            title: 'Thất bại!',
            message: 'Vui lòng nhập lại',
            type: 'error',
            duration: 3000,
          });
          this.checkForm = true;
          // window.location.href = '#registerForm';
        }
      });
  }

  clickChangeForm() {
    const loginsec = document.querySelector('.login-section');
    const loginlink = document.querySelector('.login-link');
    const registerlink = document.querySelector('.register-link');
    registerlink!.addEventListener('click', () => {
      loginsec!.classList.add('active');
    });
    loginlink!.addEventListener('click', () => {
      loginsec!.classList.remove('active');
    });
  }

  showHidePass() {
    let input = document.getElementById('passwordForm') as HTMLInputElement;
    // console.log(input!);
    if (input.type === 'password') {
      input.type = 'text';
      document.getElementById('eye')!.className = 'fa-regular fa-eye';
    } else {
      input.type = 'password';
      document.getElementById('eye')!.className = 'fa-regular fa-eye-slash';
    }
  }
}