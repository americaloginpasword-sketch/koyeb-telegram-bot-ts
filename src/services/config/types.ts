/**
 * @file: src/services/config/types.ts
 * @description: Типы конфигурации приложения и контента
 * @created: 2025-08-19
 */

export interface AppConfig {
  version: string;
  telegram: {
    bot_token?: string;
    webhook_url?: string;
    allowed_updates?: string[];
  };
  payment: {
    provider: string;
    currency: string;
    amount: number;
    geo: string;
  };
  support: {
    contact_url: string;
  };
  content: {
    posts_file: string;
  };
  analytics?: {
    google_sheets?: {
      sheet_id: string;
      service_account_email: string;
      private_key_path: string;
    };
  };
  public_base_url?: string;
  rate_limit?: {
    user_per_minute: number;
    burst: number;
  };
  security?: {
    verify_webhooks: boolean;
    allowed_webhook_sources: string[];
  };
}

export interface PostButtonMaterial {
  label: string;
  action: "material";
  url: string;
}

export interface PostButtonSupport {
  label: string;
  action: "support";
  url: string;
}

export interface PostButtonCommunity {
  label: string;
  action: "community";
  message: string;
}

export interface PostButtonPayment {
  label: string;
  action: "payment";
  price?: number;
  currency?: string;
  provider?: string;
}

export interface PostButtonWebinar {
  label: string;
  action: "webinar";
  url: string;
}

export interface PostButtonJump {
  label: string;
  action: "jump";
  target_post: number;
}

export type PostButton =
  | PostButtonMaterial
  | PostButtonSupport
  | PostButtonCommunity
  | PostButtonPayment
  | PostButtonWebinar
  | PostButtonJump;

export interface PostConfig {
  id: number;
  text_key: string;
  image: {
    url: string;
    caption?: string;
  };
  buttons: PostButton[];
}

export interface PostsConfigFile {
  version: string;
  posts: PostConfig[];
}
