export interface AccessTokenPayload {
  sub: string; // adminId
  email: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string; // adminId
  jti: string; // RefreshToken.id (used for revocation lookppppppppppppppppppppppppppup)
  type: "refresh";
}
