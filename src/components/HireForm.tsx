'use client';

import { useState, useRef, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { ClientConfig, FieldConfig } from '@/lib/types';

interface HireFormProps {
  config: ClientConfig;
}

export default function HireForm({ config }: HireFormProps) {
  const [formData, setFormData] = useState<Record<string, string | boolean>>(() => {
    const defaults: Record<string, string | boolean> = {};
    for (const section of config.sections) {
      for (const field of section.fields) {
        if (field.defaultValue) defaults[field.name] = field.defaultValue;
        else if (field.type === 'checkbox') defaults[field.name] = false;
        else defaults[field.name] = '';
      }
    }
    return defaults;
  });

  const [fileData, setFileData] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const sigRef = useRef<SignatureCanvas | null>(null);

  const handleChange = useCallback((name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((name: string, file: File | null) => {
    setFileData((prev) => ({ ...prev, [name]: file }));
  }, []);

  const validate = (): string | null => {
    for (const section of config.sections) {
      for (const field of section.fields) {
        if (!field.required) continue;
        if (field.type === 'checkbox' && !formData[field.name]) {
          return `Please accept: "${field.label.slice(0, 60)}..."`;
        }
        if (field.type === 'file' && !fileData[field.name]) {
          return `Please upload your ${field.label}`;
        }
        if (field.type === 'signature') {
          if (!sigRef.current || sigRef.current.isEmpty()) {
            return 'Please provide your signature';
          }
        }
        if (['text', 'email', 'tel', 'date', 'time', 'textarea'].includes(field.type)) {
          if (!formData[field.name] || (typeof formData[field.name] === 'string' && !(formData[field.name] as string).trim())) {
            return `Please complete: ${field.label}`;
          }
        }
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const signature = sigRef.current?.toDataURL('image/png') || '';
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientSlug: config.slug,
          formData,
          signature,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          Agreement Submitted
        </h2>
        <p className="text-black">Thank you. Your hire agreement has been received and a confirmation will be sent shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {config.sections.map((section) => (
        <div key={section.title} className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: config.primaryColor }}>
            {section.title}
          </h2>
          <div className="space-y-4">
            {section.fields.map((field) => (
              <FormField
                key={field.name}
                field={field}
                value={formData[field.name]}
                file={fileData[field.name] || null}
                onChange={handleChange}
                onFileChange={handleFileChange}
                sigRef={field.type === 'signature' ? sigRef : undefined}
                primaryColor={config.primaryColor}
              />
            ))}
          </div>
        </div>
      ))}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-6 rounded-lg text-white font-semibold text-lg transition-opacity disabled:opacity-50"
        style={{ backgroundColor: config.primaryColor }}
      >
        {submitting ? 'Submitting…' : 'Submit Agreement'}
      </button>
    </form>
  );
}

function FormField({
  field,
  value,
  file,
  onChange,
  onFileChange,
  sigRef,
  primaryColor,
}: {
  field: FieldConfig;
  value: string | boolean;
  file: File | null;
  onChange: (name: string, value: string | boolean) => void;
  onFileChange: (name: string, file: File | null) => void;
  sigRef?: React.MutableRefObject<SignatureCanvas | null>;
  primaryColor: string;
}) {
  const inputClasses = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent';

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(field.name, e.target.checked)}
          className="mt-1 h-4 w-4 rounded"
          style={{ accentColor: primaryColor }}
        />
        <span className="text-sm text-black">{field.label} {field.required && <span className="text-red-500">*</span>}</span>
      </label>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={value as string}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={inputClasses}
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
      </div>
    );
  }

  if (field.type === 'file') {
    return (
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="file"
          accept={field.accept}
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            if (f && field.maxSize && f.size > field.maxSize) {
              alert(`File exceeds maximum size of ${Math.round(field.maxSize / 1048576)}MB`);
              e.target.value = '';
              return;
            }
            onFileChange(field.name, f);
          }}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white"
          style={{ '--file-bg': primaryColor } as React.CSSProperties}
        />
        {file && <p className="text-xs text-gray-500 mt-1">{file.name}</p>}
        <p className="text-xs text-gray-400 mt-1">Max file size: 15MB. Accepted: images and PDF.</p>
      </div>
    );
  }

  if (field.type === 'signature') {
    return (
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{
              className: 'w-full',
              style: { height: '150px', width: '100%' },
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => sigRef?.current?.clear()}
          className="text-sm mt-1 underline"
          style={{ color: primaryColor }}
        >
          Clear signature
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-black mb-1">
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={field.type}
        value={value as string}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        className={inputClasses}
        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
      />
    </div>
  );
}
