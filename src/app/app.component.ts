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
    const _id = setInterval(() => {
      this.value += 5;
      if(this.value > 100){
        clearInterval(_id);
        this.value = 0;
        this.showProcess = false;
      }
    }, 200);
  }
}
