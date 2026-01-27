import { useRef } from "react";
import { type Control, type FieldValues, type Path } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";

interface FileUploadFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  required?: boolean;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  description?: string;
}

/**
 * FileUploadField Component
 *
 * Generic file upload field with preview and validation.
 * File state is managed externally (not in react-hook-form) to avoid serialization issues.
 *
 * @example
 * const [selectedFile, setSelectedFile] = useState<File | null>(null);
 *
 * <FileUploadField
 *   control={control}
 *   name="cv"
 *   label="CV (PDF)"
 *   accept=".pdf"
 *   maxSizeMB={5}
 *   selectedFile={selectedFile}
 *   onFileSelect={setSelectedFile}
 *   required
 * />
 */
export function FileUploadField<T extends FieldValues>({
  control,
  name,
  label,
  accept = "*",
  maxSizeMB = 10,
  disabled = false,
  required = false,
  selectedFile,
  onFileSelect,
  description,
}: FileUploadFieldProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      onFileSelect(null);
      return;
    }

    // Validazione dimensione
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      onFileSelect(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    onFileSelect(file);
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </FormLabel>
          <FormControl>
            <div className="space-y-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                disabled={disabled}
                className="hidden" // Nascondiamo input nativo
              />

              {!selectedFile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="w-full justify-start text-muted-foreground font-normal"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Sfoglia file...
                </Button>
              )}

              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </FormControl>

          {/* File Preview */}
          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md mt-2">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm truncate">
                {selectedFile.name}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                disabled={disabled}
                className="h-6 w-6 shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
