import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { HttpClient, HttpResponse } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class BackendService {
  private readonly BACKEND_URL = "https://1248-178-197-206-91.ngrok-free.app";

  constructor(private readonly httpClient: HttpClient) {}

  public getRegistrationOptions$(
    username: string,
    displayName: string,
  ): Observable<CredentialCreationOptions> {
    return this.httpClient.post<CredentialCreationOptions>(
      this.BACKEND_URL +
        `/register?username=${username}&display=${displayName}`,
      {},
      {
        observe: "body",
      },
    );
  }

  public registerCredential$(
    username: string,
    credentialName: string,
    credential: any,
  ): Observable<HttpResponse<void>> {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("credentialName", credentialName);
    formData.append("credential", JSON.stringify(credential));
    return this.httpClient.post<void>(
      this.BACKEND_URL + `/finishauth`,
      formData,
      {
        observe: "response",
      },
    );
  }

  public getRequestOptions$(
    username: string,
  ): Observable<CredentialRequestOptions> {
    return this.httpClient.post<CredentialRequestOptions>(
      this.BACKEND_URL + `/login?username=${username}`,
      {},
      {
        observe: "body",
      },
    );
  }

  public login$(
    username: string,
    credential: any,
  ): Observable<LoginResponseDto> {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("credential", JSON.stringify(credential));
    return this.httpClient.post<LoginResponseDto>(
      this.BACKEND_URL + `/welcome`,
      formData,
      {
        observe: "body",
      },
    );
  }
}

export interface LoginResponseDto {
  response: string;
}
