import { type Control } from "react-hook-form";
import { FileUploadField } from "@/features/shared/components/fields/FileUploadField";
import { TextareaField } from "@/features/shared/components/fields/TextareaField";
import type { ApplyJobFormValues } from "../../schemas/application-schema";

interface ApplyJobFormProps {
  control: Control<ApplyJobFormValues>;
  isSubmitting: boolean;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
}

/**
 * ApplyJobForm Component
 *
 * Form per candidarsi a un job con CV upload e cover letter opzionale
 *
 * @example
 * const [selectedFile, setSelectedFile] = useState<File | null>(null);
 *
 * <ApplyJobForm
 *   control={form.control}
 *   isSubmitting={applyJobMutation.isPending}
 *   selectedFile={selectedFile}
 *   onFileSelect={setSelectedFile}
 * />
 */
export function ApplyJobForm({
  control,
  isSubmitting,
  selectedFile,
  onFileSelect,
}: ApplyJobFormProps) {
  return (
    <div className="space-y-4">
      {/* CV Upload */}
      <FileUploadField
        control={control}
        name="jobId" // Placeholder per validazione form, file gestito fuori
        label="CV (PDF)"
        accept=".pdf"
        maxSizeMB={5}
        selectedFile={selectedFile}
        onFileSelect={onFileSelect}
        disabled={isSubmitting}
        required
        description="Formato supportato: PDF (max 5MB)"
      />

      {/* Cover Letter */}
      <TextareaField
        control={control}
        name="coverLetter"
        label="Lettera di Presentazione (opzionale)"
        placeholder="Descrivi perché sei il candidato ideale per questa posizione..."
        rows={5}
        disabled={isSubmitting}
      />
    </div>
  );
}
