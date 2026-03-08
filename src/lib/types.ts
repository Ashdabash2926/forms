export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'time' | 'textarea' | 'checkbox' | 'file' | 'signature';
  required: boolean;
  placeholder?: string;
  defaultValue?: string;
  accept?: string;
  maxSize?: number;
}

export interface SectionConfig {
  title: string;
  fields: FieldConfig[];
}

export interface ClientConfig {
  clientName: string;
  slug: string;
  logo: string;
  primaryColor: string;
  accentColor: string;
  notificationEmail: string;
  driveFolder: string;
  formTitle: string;
  sections: SectionConfig[];
}
