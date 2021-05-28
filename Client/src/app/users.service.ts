import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, JsonpClientBackend } from '@angular/common/http';
import { UserModel } from './models/user.model';
import { catchError, map, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private serverUrl = 'http://localhost:1902';
  private currentUserSubject: BehaviorSubject<UserModel>;
  public currentUser: Observable<UserModel>;
  public currUserModel: UserModel;

  constructor(public http: HttpClient, private cookie: CookieService) {
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
    return this.http.post(`${this.serverUrl}/users/signup`, { id: jsonId, userName: jsonUserName, password: jsonPassword });
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

  userConected(user: UserModel) {
    this.cookie.set('user', JSON.stringify(user));
  }

  getUser() {
    let tmp=  this.cookie.get('user');
    console.log(tmp);
    return JSON.parse(tmp);
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getAllUsers() {
    return this.http.get(`${this.serverUrl}/users/`)
    .pipe(map((res) => <UserModel[]>(res)));
  }
}
