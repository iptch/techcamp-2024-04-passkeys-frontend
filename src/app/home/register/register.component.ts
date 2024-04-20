import { Component } from "@angular/core";
import { PasskeyService } from "../../passkey.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent {
  inProgress = false;
  username = "";
  displayName = "";

  constructor(
    private readonly passkeyService: PasskeyService,
    private readonly snackBar: MatSnackBar,
  ) {}

  registerClicked(): void {
    this.inProgress = true;
    this.passkeyService
      .registerPasskey$(this.username, this.displayName)
      .subscribe({
        next: () => {},
        complete: () => {
          this.inProgress = false;
          this.snackBar.open("Successfully registered passkey!", undefined, {
            duration: 3000,
          });
        },
        error: err => {
          this.inProgress = false;
          this.snackBar.open("Failed to register passkey :(", undefined, {
            duration: 3000,
          });
          console.error(err);
        },
      });
  }
}
