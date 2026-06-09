import React, { useRef, useState } from "react";
import { api, API } from "../lib/api";
import { toast } from "sonner";
import { Upload, Loader2, X } from "lucide-react";

/**
 * ImageUpload — uploads to /api/upload, returns the file URL
 * Props:
 *   value: current image URL (string)
 *   onChange: (url) => void  — called with full URL after upload
 *   label: input label
 */
export default function ImageUpload({ value, onChange, label = "Upload", testId = "image-upload" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast.error("Max 8MB"); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
      const fullUrl = `${API}/files/${data.file_id}`;
      onChange(fullUrl);
      toast.success("Uploaded!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div data-testid={testId}>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="w-24 h-24 rounded-xl object-cover border border-white/10"/>
          <button type="button" onClick={()=>onChange("")} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600" data-testid={`${testId}-remove`}><X size={12}/></button>
        </div>
      ) : (
        <button type="button" onClick={()=>inputRef.current?.click()} disabled={uploading} className="w-24 h-24 rounded-xl border-2 border-dashed border-white/15 hover:border-[#7C5CFF] flex flex-col items-center justify-center text-white/50 text-xs gap-1 transition-colors" data-testid={`${testId}-pick`}>
          {uploading ? <Loader2 size={20} className="animate-spin"/> : <><Upload size={18}/> {label}</>}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick}/>
    </div>
  );
}
