export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "BUYER" | "SELLER" | "ADMIN";
export type StoreStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";
export type PaymentMethod = "PIX" | "CREDIT_CARD" | "BOLETO";
export type PixKeyType = "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM_KEY";
export type BankAccountType = "CHECKING" | "SAVINGS";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          supabase_uid: string | null;
          name: string;
          email: string;
          phone: string | null;
          cpf: string | null;
          role: UserRole;
          avatar_url: string | null;
          email_verified: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supabase_uid?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          cpf?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          email_verified?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supabase_uid?: string | null;
          name?: string;
          email?: string;
          phone?: string | null;
          cpf?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          email_verified?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stores: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          banner_url: string | null;
          cnpj: string | null;
          commercial_phone: string;
          whatsapp_number: string;
          status: StoreStatus;
          commission_rate: number;
          physical_location: string | null;
          bank_code: string | null;
          bank_name: string | null;
          bank_agency: string | null;
          bank_account: string | null;
          bank_account_digit: string | null;
          bank_account_type: BankAccountType | null;
          account_holder_name: string | null;
          account_holder_document: string | null;
          pix_key_type: PixKeyType | null;
          pix_key: string | null;
          mercadopago_collector_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          cnpj?: string | null;
          commercial_phone: string;
          whatsapp_number: string;
          status?: StoreStatus;
          commission_rate?: number;
          physical_location?: string | null;
          bank_code?: string | null;
          bank_name?: string | null;
          bank_agency?: string | null;
          bank_account?: string | null;
          bank_account_digit?: string | null;
          bank_account_type?: BankAccountType | null;
          account_holder_name?: string | null;
          account_holder_document?: string | null;
          pix_key_type?: PixKeyType | null;
          pix_key?: string | null;
          mercadopago_collector_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          cnpj?: string | null;
          commercial_phone?: string;
          whatsapp_number?: string;
          status?: StoreStatus;
          commission_rate?: number;
          physical_location?: string | null;
          bank_code?: string | null;
          bank_name?: string | null;
          bank_agency?: string | null;
          bank_account?: string | null;
          bank_account_digit?: string | null;
          bank_account_type?: BankAccountType | null;
          account_holder_name?: string | null;
          account_holder_document?: string | null;
          pix_key_type?: PixKeyType | null;
          pix_key?: string | null;
          mercadopago_collector_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stores_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          image_url: string | null;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          category_id: string | null;
          title: string;
          slug: string;
          description: string | null;
          status: ProductStatus;
          retail_price: number;
          wholesale_price: number;
          min_wholesale_qty: number;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          category_id?: string | null;
          title: string;
          slug: string;
          description?: string | null;
          status?: ProductStatus;
          retail_price: number;
          wholesale_price: number;
          min_wholesale_qty?: number;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          category_id?: string | null;
          title?: string;
          slug?: string;
          description?: string | null;
          status?: ProductStatus;
          retail_price?: number;
          wholesale_price?: number;
          min_wholesale_qty?: number;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      product_variations: {
        Row: {
          id: string;
          product_id: string;
          sku: string;
          size: string;
          color: string;
          color_hex: string | null;
          stock: number;
          additional_price: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          sku: string;
          size: string;
          color: string;
          color_hex?: string | null;
          stock?: number;
          additional_price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          sku?: string;
          size?: string;
          color?: string;
          color_hex?: string | null;
          stock?: number;
          additional_price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variations_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          display_order: number;
          is_main: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt_text?: string | null;
          display_order?: number;
          is_main?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          alt_text?: string | null;
          display_order?: number;
          is_main?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          recipient_name: string;
          zip_code: string;
          street: string;
          number: string;
          complement: string | null;
          neighborhood: string;
          city: string;
          state: string;
          phone: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recipient_name: string;
          zip_code: string;
          street: string;
          number: string;
          complement?: string | null;
          neighborhood: string;
          city: string;
          state: string;
          phone?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipient_name?: string;
          zip_code?: string;
          street?: string;
          number?: string;
          complement?: string | null;
          neighborhood?: string;
          city?: string;
          state?: string;
          phone?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          buyer_id: string;
          store_id: string;
          shipping_address_id: string | null;
          status: OrderStatus;
          payment_method: PaymentMethod;
          total_amount: number;
          shipping_amount: number;
          platform_fee_rate: number;
          platform_fee_amount: number;
          seller_net_amount: number;
          mercadopago_payment_id: string | null;
          pix_qrcode: string | null;
          pix_qrcode_base64: string | null;
          shipping_carrier: string | null;
          tracking_code: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          buyer_id: string;
          store_id: string;
          shipping_address_id?: string | null;
          status?: OrderStatus;
          payment_method?: PaymentMethod;
          total_amount: number;
          shipping_amount?: number;
          platform_fee_rate?: number;
          platform_fee_amount?: number;
          seller_net_amount?: number;
          mercadopago_payment_id?: string | null;
          pix_qrcode?: string | null;
          pix_qrcode_base64?: string | null;
          shipping_carrier?: string | null;
          tracking_code?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          buyer_id?: string;
          store_id?: string;
          shipping_address_id?: string | null;
          status?: OrderStatus;
          payment_method?: PaymentMethod;
          total_amount?: number;
          shipping_amount?: number;
          platform_fee_rate?: number;
          platform_fee_amount?: number;
          seller_net_amount?: number;
          mercadopago_payment_id?: string | null;
          pix_qrcode?: string | null;
          pix_qrcode_base64?: string | null;
          shipping_carrier?: string | null;
          tracking_code?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey";
            columns: ["shipping_address_id"];
            isOneToOne: false;
            referencedRelation: "addresses";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_variation_id: string | null;
          product_title: string;
          variation_details: string;
          sku: string;
          is_wholesale_price: boolean;
          unit_price: number;
          quantity: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_variation_id?: string | null;
          product_title: string;
          variation_details: string;
          sku: string;
          is_wholesale_price?: boolean;
          unit_price: number;
          quantity: number;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_variation_id?: string | null;
          product_title?: string;
          variation_details?: string;
          sku?: string;
          is_wholesale_price?: boolean;
          unit_price?: number;
          quantity?: number;
          subtotal?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_variation_id_fkey";
            columns: ["product_variation_id"];
            isOneToOne: false;
            referencedRelation: "product_variations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      store_status: StoreStatus;
      product_status: ProductStatus;
      order_status: OrderStatus;
      payment_method: PaymentMethod;
      pix_key_type: PixKeyType;
      bank_account_type: BankAccountType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
