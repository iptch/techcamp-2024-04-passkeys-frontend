import { Component } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { LoginResponseDto } from "src/app/backend.service";
import { PasskeyService } from "src/app/passkey.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  inProgress = false;
  username = "";

  constructor(
    private readonly passkeyService: PasskeyService,
    private readonly snackBar: MatSnackBar,
  ) {}

  loginClicked(): void {
    this.inProgress = true;
    this.passkeyService.authenticate$(this.username).subscribe({
      next: (serverResponse: LoginResponseDto) => {
        this.inProgress = false;
        this.snackBar.open(
          `Login succeeded! Server says: ${serverResponse.response}`,
          undefined,
          {
            duration: 3000,
          },
        );
      },
      complete: () => {},
      error: err => {
        this.inProgress = false;
        console.error(err);
        this.snackBar.open("Login failed :(", undefined, {
          duration: 3000,
        });
      },
    });
  }
}
