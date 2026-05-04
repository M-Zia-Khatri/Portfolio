export interface Contact {
  id: string;
  full_name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface ContactFilters {
  search: string;
}
