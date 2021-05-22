import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, JsonpClientBackend } from '@angular/common/http';
import { UserModel } from './models/user.model';
import { catchError, map, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private serverUrl = 'http://localhost:1902';
  private currentUserSubject: BehaviorSubject<UserModel>;
  public currentUser: Observable<UserModel>;
  public currUserModel: UserModel;

  constructor(public http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<UserModel>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): UserModel {
    return this.currentUserSubject.value;
  }

  addNewUser(newUser: UserModel) {
    console.log(` before id user: ${newUser.id}`);
    let jsonId = JSON.stringify(newUser.id);
    let jsonUserName = JSON.stringify(newUser.userName);
    let jsonPassword = JSON.stringify(newUser.password);
    return this.http.post(`${this.serverUrl}/users/signup`, { id:jsonId, userName: jsonUserName, password: jsonPassword });
  }

  login(userName, password) {
    let jsonUserName = JSON.stringify(userName);
    let jsonPassword = JSON.stringify(password);
    return this.http.post<any>(`${this.serverUrl}/users/login`, { userName: jsonUserName, password: jsonPassword })
      .pipe(map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user); 
        return user;
      }));
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getAllUsers() {
    return this.http.get(`${this.serverUrl}/users/`);
  }

  getUser(user: UserModel) {
    //this.gotUser = user;
  }
  // login(name, pass) {
  //   this.user = { "name": name, "pass": pass };
  //   this.http.post<any>("http://localhost:1000/login", { name, pass })
  //     .subscribe(res => {
  //       //if res == stats200 send user to lobby ***with his name to socket
  //       console.log('loged in')
  //       if (res.statusCode === 200) {
  //        this.service.current_user = name
  //         this.socket.emit("user_conncted",name)
  //         this.router.navigate(['/lobby'])
  //       }
  //       //else tell user his name/pass worng!!
  //     }, er => {
  //       console.log(er);
  //       alert(er.error.error);
  //     });

}
