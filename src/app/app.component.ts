import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {


  showProcess = false;
  value = 0;
  constructor() {
  }

  onClick() {
    this.showProcess = true;
    setInterval(() => {
      this.value += 5;
    }, 200);
  }
}
