import { Injectable } from "@angular/core";
import { BackendService, LoginResponseDto } from "./backend.service";
import { Observable, of, switchMap, throwError } from "rxjs";
import { toByteArray, fromByteArray } from "base64-js";
import { HttpResponse } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class PasskeyService {
  constructor(private readonly backendService: BackendService) {}

  public registerPasskey$(
    username: string,
    displayName: string,
  ): Observable<HttpResponse<void>> {
    return this.backendService
      .getRegistrationOptions$(username, displayName)
      .pipe(
        switchMap(registrationOptions => {
          if (registrationOptions.publicKey) {
            if (registrationOptions.publicKey.user.id) {
              registrationOptions.publicKey.user.id =
                this.base64urlToUint8array(
                  registrationOptions.publicKey.user.id,
                );
            }
            registrationOptions.publicKey.challenge =
              this.base64urlToUint8array(
                registrationOptions.publicKey.challenge,
              );
          }
          return navigator.credentials.create(
            registrationOptions,
          ) as unknown as Observable<PublicKeyCredential>;
        }),
        switchMap(publicKeyCredential => {
          if (!publicKeyCredential) {
            throw new Error("Could not obtain public key credential");
          }

          console.group("[+] Obtained public key credential for registration");
          console.dir(publicKeyCredential);
          console.groupEnd();

          return this.backendService.registerCredential$(
            username,
            "credential-name", // TODO: let the user choose this
            {
              type: publicKeyCredential.type,
              id: publicKeyCredential.id,
              response: {
                attestationObject: this.uint8arrayToBase64url(
                  (
                    publicKeyCredential.response as unknown as AuthenticatorAttestationResponse
                  ).attestationObject,
                ),
                clientDataJSON: this.uint8arrayToBase64url(
                  publicKeyCredential.response.clientDataJSON,
                ),
                transports:
                  ((
                    publicKeyCredential.response as unknown as AuthenticatorAttestationResponse
                  ).getTransports &&
                    (
                      publicKeyCredential.response as unknown as AuthenticatorAttestationResponse
                    ).getTransports()) ||
                  [],
              },
              clientExtensionResults:
                publicKeyCredential.getClientExtensionResults(),
            },
          );
        }),
      );
  }

  public authenticate$(username: string): Observable<LoginResponseDto> {
    return this.backendService.getRequestOptions$(username).pipe(
      switchMap(requestOptions => {
        if (requestOptions.publicKey) {
          if (requestOptions.publicKey.allowCredentials) {
            for (const cred of requestOptions.publicKey.allowCredentials) {
              cred.id = this.base64urlToUint8array(cred.id);
            }
          }
          requestOptions.publicKey.challenge = this.base64urlToUint8array(
            requestOptions.publicKey.challenge,
          );
        }
        return navigator.credentials.get(
          requestOptions,
        ) as unknown as Observable<PublicKeyCredential>;
      }),
      switchMap(publicKeyCredential => {
        console.group("[+] Obtained public key credential for login");
        console.dir(publicKeyCredential);
        console.groupEnd();

        return this.backendService.login$(username, {
          type: publicKeyCredential.type,
          id: publicKeyCredential.id,
          response: {
            authenticatorData: this.uint8arrayToBase64url(
              (publicKeyCredential.response as unknown as any)
                .authenticatorData,
            ),
            clientDataJSON: this.uint8arrayToBase64url(
              publicKeyCredential.response.clientDataJSON,
            ),
            signature: this.uint8arrayToBase64url(
              (publicKeyCredential.response as unknown as any).signature,
            ),
            userHandle:
              (publicKeyCredential.response as unknown as any).userHandle &&
              this.uint8arrayToBase64url(
                (publicKeyCredential.response as unknown as any).userHandle,
              ),
          },
          clientExtensionResults:
            publicKeyCredential.getClientExtensionResults(),
        });
      }),
    );
  }

  private base64urlToUint8array(base64Bytes: any): any {
    const padding = "====".substring(0, (4 - (base64Bytes.length % 4)) % 4);
    return toByteArray(
      (base64Bytes + padding).replace(/\//g, "_").replace(/\+/g, "-"),
    );
  }

  private uint8arrayToBase64url(bytes: any): any {
    if (bytes instanceof Uint8Array) {
      return fromByteArray(bytes)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    } else {
      return this.uint8arrayToBase64url(new Uint8Array(bytes));
    }
  }
}
