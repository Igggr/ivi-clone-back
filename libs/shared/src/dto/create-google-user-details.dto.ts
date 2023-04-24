export class CreateGoogleUserDetailsDto {
  constructor(email, displayName) {
    this.email = email;
    this.displayName = displayName;
  }
  email: string;
  displayName: string;
}
