/**
 * Perfex CRM Type Definitions
 * Định nghĩa TypeScript interfaces cho tất cả entities từ Perfex CRM API
 */

// ==================== BASE TYPES ====================

export interface BaseEntity {
  id: string;
  dateCreated?: string;
  dateUpdated?: string;
}

export interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ListResponse<T> {
  status: boolean;
  data: T[];
  total?: number;
  page?: number;
  perPage?: number;
}

// ==================== CUSTOMER ====================

export interface Customer extends BaseEntity {
  userid: string;
  company: string;
  vat?: string;
  phonenumber?: string;
  country?: string;
  city?: string;
  zip?: string;
  state?: string;
  address?: string;
  website?: string;
  datecreated: string;
  active: string; // "0" | "1"
  leadid?: string;
  billing_street?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  shipping_street?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country?: string;
  longitude?: string;
  latitude?: string;
  default_language?: string;
  default_currency?: string;
  show_primary_contact?: string;
  stripe_id?: string;
  registration_confirmed?: string;
  addedfrom?: string;
}

// ==================== CONTACT ====================

export interface Contact extends BaseEntity {
  userid: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber?: string;
  title?: string;
  datecreated: string;
  password?: string;
  last_ip?: string;
  last_login?: string;
  last_password_change?: string;
  active: string; // "0" | "1"
  profile_image?: string;
  direction?: string;
  invoice_emails?: string; // "0" | "1"
  estimate_emails?: string; // "0" | "1"
  credit_note_emails?: string; // "0" | "1"
  contract_emails?: string; // "0" | "1"
  task_emails?: string; // "0" | "1"
  project_emails?: string; // "0" | "1"
  ticket_emails?: string; // "0" | "1"
  is_primary: string; // "0" | "1"
}

// ==================== INVOICE ====================

export interface Invoice extends BaseEntity {
  invoiceid: string;
  sent: string; // "0" | "1"
  datesend?: string;
  clientid: string;
  deleted_customer_name?: string;
  number: string;
  prefix?: string;
  number_format?: string;
  datecreated: string;
  date: string;
  duedate: string;
  currency: string;
  subtotal: string;
  total_tax: string;
  total: string;
  adjustment?: string;
  addedfrom: string;
  hash: string;
  status: string; // "1" = Unpaid, "2" = Paid, "3" = Overdue, "4" = Cancelled
  clientnote?: string;
  adminnote?: string;
  last_overdue_reminder?: string;
  cancel_overdue_reminders?: string;
  allowed_payment_modes?: string;
  token?: string;
  discount_percent?: string;
  discount_total?: string;
  discount_type?: string;
  recurring?: string;
  recurring_type?: string;
  custom_recurring?: string;
  cycles?: string;
  total_cycles?: string;
  is_recurring_from?: string;
  last_recurring_date?: string;
  terms?: string;
  sale_agent?: string;
  billing_street?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  shipping_street?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country?: string;
  include_shipping?: string;
  show_shipping_on_invoice?: string;
  show_quantity_as?: string;
  project_id?: string;
  subscription_id?: string;
}

// ==================== PRODUCT ====================

export interface Product extends BaseEntity {
  description: string;
  long_description?: string;
  rate: string; // Decimal as string
  tax?: string;
  tax2?: string;
  unit?: string;
  group_id?: string;
}

// ==================== LEAD ====================

export interface Lead extends BaseEntity {
  name: string;
  title?: string;
  company?: string;
  description?: string;
  country?: string;
  zip?: string;
  city?: string;
  state?: string;
  address?: string;
  assigned?: string; // Staff ID
  dateadded: string;
  from_form_id?: string;
  status: string; // Lead status ID
  source?: string; // Lead source ID
  lastcontact?: string;
  dateassigned?: string;
  last_status_change?: string;
  addedfrom: string;
  email?: string;
  website?: string;
  leadorder?: string;
  phonenumber?: string;
  date_converted?: string;
  lost?: string; // "0" | "1"
  junk?: string; // "0" | "1"
  last_lead_status?: string;
  is_imported_from_email_integration?: string;
  email_integration_uid?: string;
  is_public?: string; // "0" | "1"
  default_language?: string;
  client_id?: string;
  lead_value?: string;
}

// ==================== PROJECT ====================

export interface Project extends BaseEntity {
  name: string;
  description?: string;
  status: string; // Project status ID
  clientid: string;
  billing_type: string; // "1" = Fixed rate, "2" = Project hours, "3" = Task hours
  start_date: string;
  deadline?: string;
  project_created: string;
  date_finished?: string;
  progress?: string;
  progress_from_tasks?: string;
  project_cost?: string;
  project_rate_per_hour?: string;
  estimated_hours?: string;
  addedfrom: string;
  contact_notification?: string; // "0" | "1"
  notify_contacts?: string; // "0" | "1"
}

// ==================== MILESTONE ====================

export interface Milestone extends BaseEntity {
  name: string;
  description?: string;
  description_visible_to_customer?: string; // "0" | "1"
  due_date: string;
  date_finished?: string; // Optional - set when milestone is completed
  project_id: string;
  color?: string;
  milestone_order?: string;
  datecreated: string;
}

// ==================== STAFF ====================

export interface Staff extends BaseEntity {
  email: string;
  firstname: string;
  lastname: string;
  facebook?: string;
  linkedin?: string;
  phonenumber?: string;
  skype?: string;
  password?: string;
  datecreated: string;
  profile_image?: string;
  last_ip?: string;
  last_login?: string;
  last_activity?: string;
  last_password_change?: string;
  new_pass_key?: string;
  new_pass_key_requested?: string;
  email_signature?: string;
  direction?: string;
  active: string; // "0" | "1"
  default_language?: string;
  email_notifications?: string; // "0" | "1"
  role?: string; // Role ID
  media_path_slug?: string;
  is_not_staff?: string; // "0" | "1"
  hourly_rate?: string;
  two_factor_auth_enabled?: string; // "0" | "1"
  two_factor_auth_code?: string;
  two_factor_auth_code_requested?: string;
  email_verification_key?: string;
  email_verification_sent_at?: string;
  administrator?: string; // "0" | "1"
}

// ==================== TASK ====================

export interface Task extends BaseEntity {
  name: string;
  description?: string;
  priority: string; // "1" = Low, "2" = Medium, "3" = High, "4" = Urgent
  dateadded: string;
  startdate?: string;
  duedate?: string;
  datefinished?: string;
  addedfrom: string;
  is_added_from_contact?: string; // "0" | "1"
  status: string; // Task status ID
  recurring_type?: string;
  repeat_every?: string;
  recurring?: string; // "0" | "1"
  is_recurring_from?: string;
  cycles?: string;
  total_cycles?: string;
  custom_recurring?: string;
  last_recurring_date?: string;
  rel_id?: string;
  rel_type?: string; // "project", "invoice", "customer", "estimate", "contract", "ticket", "expense", "lead", "proposal"
  is_public?: string; // "0" | "1"
  billable?: string; // "0" | "1"
  billed?: string; // "0" | "1"
  invoice_id?: string;
  hourly_rate?: string;
  milestone?: string; // Milestone ID
  kanban_order?: string;
  milestone_order?: string;
  visible_to_client?: string; // "0" | "1"
  deadline_notified?: string; // "0" | "1"
}

// ==================== TICKET ====================

export interface Ticket extends BaseEntity {
  ticketid: string;
  adminreplying?: string; // Staff ID
  userid: string; // Customer ID
  contactid?: string;
  merged_ticket_id?: string;
  email: string;
  name: string;
  department?: string; // Department ID
  priority: string; // "1" = Low, "2" = Medium, "3" = High, "4" = Urgent
  status: string; // Ticket status ID
  service?: string; // Service ID
  ticket_key: string;
  subject: string;
  message: string;
  admin?: string;
  date: string;
  project_id?: string;
  lastreply?: string;
  clientread?: string; // "0" | "1"
  adminread?: string; // "0" | "1"
  assigned?: string; // Staff ID
  staff_id_replying?: string;
  cc?: string;
}

// ==================== CONTRACT ====================

export interface Contract extends BaseEntity {
  content?: string;
  description?: string;
  subject: string;
  client: string; // Customer ID
  datestart: string;
  dateend?: string;
  contract_type?: string; // Contract type ID
  project_id?: string;
  addedfrom: string;
  dateadded: string;
  isexpirynotified?: string; // "0" | "1"
  contract_value?: string;
  trash?: string; // "0" | "1"
  not_visible_to_client?: string; // "0" | "1"
  hash: string;
  signed?: string; // "0" | "1"
  signature?: string;
  marked_as_signed?: string; // "0" | "1"
  acceptance_firstname?: string;
  acceptance_lastname?: string;
  acceptance_email?: string;
  acceptance_date?: string;
  acceptance_ip?: string;
  short_link?: string;
}

// ==================== CREDIT NOTE ====================

export interface CreditNote extends BaseEntity {
  clientid: string;
  deleted_customer_name?: string;
  number: string;
  prefix?: string;
  number_format?: string;
  datecreated: string;
  date: string;
  adminnote?: string;
  clientnote?: string;
  terms?: string;
  currency: string;
  subtotal: string;
  total_tax: string;
  total: string;
  adjustment?: string;
  addedfrom: string;
  hash: string;
  status: string; // "1" = Open, "2" = Closed, "3" = Void
  reference_no?: string;
  billing_street?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  shipping_street?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country?: string;
  include_shipping?: string;
  show_shipping_on_credit_note?: string;
  show_quantity_as?: string;
  discount_percent?: string;
  discount_total?: string;
  discount_type?: string;
  project_id?: string;
}

// ==================== ESTIMATE (QUOTE) ====================

export interface Estimate extends BaseEntity {
  estimateid: string;
  sent: string; // "0" | "1"
  datesend?: string;
  clientid: string;
  deleted_customer_name?: string;
  project_id?: string;
  number: string;
  prefix?: string;
  number_format?: string;
  hash: string;
  datecreated: string;
  date: string;
  expirydate?: string;
  currency: string;
  subtotal: string;
  total_tax: string;
  total: string;
  adjustment?: string;
  addedfrom: string;
  status: string; // "1" = Draft, "2" = Sent, "3" = Declined, "4" = Accepted, "5" = Expired
  clientnote?: string;
  adminnote?: string;
  discount_percent?: string;
  discount_total?: string;
  discount_type?: string;
  invoiceid?: string;
  invoiced_date?: string;
  terms?: string;
  reference_no?: string;
  sale_agent?: string;
  billing_street?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  shipping_street?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country?: string;
  include_shipping?: string;
  show_shipping_on_estimate?: string;
  show_quantity_as?: string;
  pipeline_order?: string;
  is_expiry_notified?: string; // "0" | "1"
  acceptance_firstname?: string;
  acceptance_lastname?: string;
  acceptance_email?: string;
  acceptance_date?: string;
  acceptance_ip?: string;
  signature?: string;
  short_link?: string;
}

// ==================== EXPENSE ====================

export interface Expense extends BaseEntity {
  category: string; // Expense category ID
  currency: string;
  amount: string;
  tax?: string;
  tax2?: string;
  reference_no?: string;
  note?: string;
  expense_name?: string;
  clientid?: string;
  project_id?: string;
  billable?: string; // "0" | "1"
  invoiceid?: string;
  paymentmode?: string; // Payment mode ID
  date: string;
  recurring_type?: string;
  repeat_every?: string;
  recurring?: string; // "0" | "1"
  cycles?: string;
  total_cycles?: string;
  custom_recurring?: string;
  last_recurring_date?: string;
  create_invoice_billable?: string; // "0" | "1"
  send_invoice_to_customer?: string; // "0" | "1"
  recurring_from?: string;
  dateadded: string;
  addedfrom: string;
}

// ==================== EXPENSE CATEGORY ====================

export interface ExpenseCategory extends BaseEntity {
  name: string;
  description?: string;
}

// ==================== PAYMENT ====================

export interface Payment extends BaseEntity {
  invoiceid: string;
  amount: string;
  paymentmode?: string; // Payment mode ID
  paymentmethod?: string;
  date: string;
  daterecorded: string;
  note?: string;
  transactionid?: string;
}

// ==================== PAYMENT MODE ====================

export interface PaymentMode extends BaseEntity {
  name: string;
  description?: string;
  show_on_pdf?: string; // "0" | "1"
  invoices_only?: string; // "0" | "1"
  expenses_only?: string; // "0" | "1"
  selected_by_default?: string; // "0" | "1"
  active?: string; // "0" | "1"
}

// ==================== CUSTOM FIELD ====================

export interface CustomField {
  id: string;
  fieldto: string; // "customer", "contact", "invoice", "estimate", etc.
  name: string;
  slug: string;
  required?: string; // "0" | "1"
  type: string; // "input", "textarea", "select", "multiselect", "date", "datetime", "number", "link", "checkbox"
  options?: string;
  display_inline?: string; // "0" | "1"
  field_order?: string;
  active?: string; // "0" | "1"
  show_on_pdf?: string; // "0" | "1"
  show_on_table?: string; // "0" | "1"
  show_on_client_portal?: string; // "0" | "1"
  disalow_client_to_edit?: string; // "0" | "1"
  bs_column?: string;
  default_value?: string;
  only_admin?: string; // "0" | "1"
}

// ==================== SEARCH & FILTER ====================

export interface SearchParams {
  search?: string;
  limit?: number;
  offset?: number;
  order_by?: string;
  order_dir?: 'asc' | 'desc';
}

export interface CustomerSearchParams extends SearchParams {
  active?: '0' | '1';
  country?: string;
}

export interface InvoiceSearchParams extends SearchParams {
  status?: string;
  clientid?: string;
  project_id?: string;
  year?: string;
}

export interface ProjectSearchParams extends SearchParams {
  status?: string;
  clientid?: string;
}

export interface TaskSearchParams extends SearchParams {
  status?: string;
  rel_type?: string;
  rel_id?: string;
  assigned?: string;
}

export interface TicketSearchParams extends SearchParams {
  status?: string;
  priority?: string;
  department?: string;
  userid?: string;
}
