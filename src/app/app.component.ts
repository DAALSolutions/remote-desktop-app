import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {RemoteDesktopComponent} from "./component/remote-desktop/remote-desktop.component";
import {MACHINE_ID, MACHINE_NAME} from "./constants/constants";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RemoteDesktopComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  public machineName = MACHINE_NAME;
  public machineId = MACHINE_ID;

}
