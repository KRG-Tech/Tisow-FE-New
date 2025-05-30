import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebsocketServiceService {
  private socket: WebSocket | undefined;
  private messageSubject: Subject<string> = new Subject<string>();
  private subscribedTopics: String[] = [];
  private wsServer: any;

  constructor(private auth: AuthService) {
    this.wsServer = environment.ws_server;
  }

  connect(topic: String): void {
    this.socket = new WebSocket(`${this.wsServer}/${topic}`);

    this.socket.onopen = () => {};

    this.socket.onmessage = (event) => {
      this.messageSubject.next(event.data);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      const indexToRemove = this.subscribedTopics.indexOf('banana'); // Find the index of the element

      if (indexToRemove > -1) {
        this.subscribedTopics.splice(indexToRemove, 1); // Remove 1 element at the found index
      }
    };
    // }
  }

  public onMessage(): Observable<string> {
    return this.messageSubject.asObservable();
  }

  public sendMessage(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error(
        'WebSocket is not open. Ready state:',
        this.socket?.readyState
      );
    }
  }
  public closeConnection() {
    this.socket?.close(1000, 'cloing connection as no longer required');
  }
}
