// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const bucketName = "products";

    // Garante que o bucket 'products' existe e é público
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const hasBucket = buckets?.some((b) => b.name === bucketName || b.id === bucketName);

      if (!hasBucket) {
        await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
      }
    } catch (bucketErr) {
      console.warn("Aviso ao verificar bucket:", bucketErr);
    }

    // Gerar nome de arquivo único
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExt = file.name.split(".").pop() || "jpg";
    const cleanFileName = `catalog/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(cleanFileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.warn("Erro no upload do Storage:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(cleanFileName);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: cleanFileName,
    });
  } catch (err: any) {
    console.error("Erro na rota /api/upload:", err);
    return NextResponse.json(
      { error: err?.message || "Falha no processamento do upload" },
      { status: 500 }
    );
  }
}
