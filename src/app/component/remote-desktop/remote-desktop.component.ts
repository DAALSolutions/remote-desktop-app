import {ChangeDetectorRef, Component, Input, Renderer2} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {WebSocketService} from "../../services/web-socket.service";
import {LoadingService} from "../../services/loading.service";
import {CommonModule} from "@angular/common";
import {ProgressSpinnerModule} from "primeng/progressspinner";

@Component({
  selector: 'app-remote-desktop',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './remote-desktop.component.html',
  styleUrl: './remote-desktop.component.css'
})
export class RemoteDesktopComponent {
  private _machineId: string;
  private socket: WebSocket;
  public base64Image: string;
  // public inNewWindow = false;
  public fps = '';
  public disconnected = false;

  @Input() public machineName: string;
  // @Input() public visible: boolean;

  get machineId(): string {
    return this._machineId;
  }

  @Input() set machineId(value: string) {
    this._machineId = this._machineId || value;
  }

  public constructor(
    private webSocketService: WebSocketService,
    // private navigationService: NavigationService,
    private loadingService: LoadingService,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
  }

  public ngOnInit(): void {
    // this.route.params.subscribe(params => {
      // if (params['machineId']) {
      //   this.machineId = params['machineId'] as string;
        // this.inNewWindow = true;
      // }
      this.setupRemoteDesktopStreaming();
    // })
  }

  public openNewWindows() {
    const popupOptions = 'width=600,height=400';
    window.open(`${URL}remote-desktop/${this.machineId}`, '_blank', popupOptions);
    // window.open(`http://localhost:4201/remote-desktop/${this.machineId}`, '_blank', popupOptions);
  }

  public ngOnDestroy(): void {
    if (this.socket) {
      this.socket.close();
    }
    this.loadingService.hideLoading();
  }

  private setupRemoteDesktopStreaming() {
    this.cdr.detectChanges();
    this.socket = this.webSocketService.connectWithWebsocket(this.machineId);
    if (this.socket) {
      this.disconnected = false;
      this.cdr.detectChanges();
    }
    this.webSocketService.connectionDied$.subscribe(() => {
      this.disconnected = true;
      this.cdr.detectChanges();
    });
    this.webSocketService.wsRemoteDesktopFrameReceived.subscribe({
      next: base64Data => {
        this.base64Image = base64Data;
        this.cdr.detectChanges();
      },
      error: err => console.log(err),
    });

    this.webSocketService.framesPerSecond$.subscribe({
      next: seconds => {
        this.fps = seconds;
      },
      error: err => console.log(err),
    });
  }

  public onVisibleChange(event: boolean) {
    if (!event) {
      // this.navigationService.closeRightBarPage(RIGHT_BAR_REMOTE_DESKTOP);
    }
  }

}
