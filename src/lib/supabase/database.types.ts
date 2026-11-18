export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      acordes: {
        Row: {
          id: string
          nombre: string
          slug: string
        }
        Insert: {
          id?: string
          nombre: string
          slug: string
        }
        Update: {
          id?: string
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      frases: {
        Row: {
          id: string
          texto: string
        }
        Insert: {
          id?: string
          texto: string
        }
        Update: {
          id?: string
          texto?: string
        }
        Relationships: []
      }
      lineas: {
        Row: {
          id: string
          nombre: string
          orden: number
          slug: string
        }
        Insert: {
          id?: string
          nombre: string
          orden?: number
          slug: string
        }
        Update: {
          id?: string
          nombre?: string
          orden?: number
          slug?: string
        }
        Relationships: []
      }
      marcas: {
        Row: {
          id: string
          nombre: string
          slug: string
        }
        Insert: {
          id?: string
          nombre: string
          slug: string
        }
        Update: {
          id?: string
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      perfume_acordes: {
        Row: {
          acorde_id: string
          perfume_id: string
        }
        Insert: {
          acorde_id: string
          perfume_id: string
        }
        Update: {
          acorde_id?: string
          perfume_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfume_acordes_acorde_id_fkey"
            columns: ["acorde_id"]
            isOneToOne: false
            referencedRelation: "acordes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfume_acordes_perfume_id_fkey"
            columns: ["perfume_id"]
            isOneToOne: false
            referencedRelation: "perfumes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfume_frases: {
        Row: {
          frase_id: string
          orden: number
          perfume_id: string
        }
        Insert: {
          frase_id: string
          orden?: number
          perfume_id: string
        }
        Update: {
          frase_id?: string
          orden?: number
          perfume_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfume_frases_frase_id_fkey"
            columns: ["frase_id"]
            isOneToOne: false
            referencedRelation: "frases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfume_frases_perfume_id_fkey"
            columns: ["perfume_id"]
            isOneToOne: false
            referencedRelation: "perfumes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfumes: {
        Row: {
          created_at: string
          descripcion: string | null
          destacado: boolean
          genero: Database["public"]["Enums"]["genero_perfume"]
          id: string
          imagen_url: string | null
          linea_id: string
          marca_id: string
          nombre: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          destacado?: boolean
          genero: Database["public"]["Enums"]["genero_perfume"]
          id?: string
          imagen_url?: string | null
          linea_id: string
          marca_id: string
          nombre: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          destacado?: boolean
          genero?: Database["public"]["Enums"]["genero_perfume"]
          id?: string
          imagen_url?: string | null
          linea_id?: string
          marca_id?: string
          nombre?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfumes_linea_id_fkey"
            columns: ["linea_id"]
            isOneToOne: false
            referencedRelation: "lineas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfumes_marca_id_fkey"
            columns: ["marca_id"]
            isOneToOne: false
            referencedRelation: "marcas"
            referencedColumns: ["id"]
          },
        ]
      }
      presentaciones: {
        Row: {
          created_at: string
          id: string
          perfume_id: string
          precio_ars: number
          precio_oferta_ars: number | null
          stock: number
          tipo: Database["public"]["Enums"]["tipo_presentacion"]
          updated_at: string
          volumen_ml: number
        }
        Insert: {
          created_at?: string
          id?: string
          perfume_id: string
          precio_ars: number
          precio_oferta_ars?: number | null
          stock?: number
          tipo: Database["public"]["Enums"]["tipo_presentacion"]
          updated_at?: string
          volumen_ml: number
        }
        Update: {
          created_at?: string
          id?: string
          perfume_id?: string
          precio_ars?: number
          precio_oferta_ars?: number | null
          stock?: number
          tipo?: Database["public"]["Enums"]["tipo_presentacion"]
          updated_at?: string
          volumen_ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "presentaciones_perfume_id_fkey"
            columns: ["perfume_id"]
            isOneToOne: false
            referencedRelation: "perfumes"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          id: number
          updated_at: string
          updated_by: string | null
          whatsapp_destino: string
        }
        Insert: {
          id: number
          updated_at?: string
          updated_by?: string | null
          whatsapp_destino: string
        }
        Update: {
          id?: number
          updated_at?: string
          updated_by?: string | null
          whatsapp_destino?: string
        }
        Relationships: []
      }
    }
    Views: {
      configuracion_publica: {
        Row: {
          whatsapp_destino: string | null
        }
        Insert: {
          whatsapp_destino?: string | null
        }
        Update: {
          whatsapp_destino?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      genero_perfume: "masculino" | "femenino" | "unisex"
      tipo_presentacion: "frasco_sellado" | "decant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      genero_perfume: ["masculino", "femenino", "unisex"],
      tipo_presentacion: ["frasco_sellado", "decant"],
    },
  },
} as const
