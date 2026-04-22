# Good Practices & Engineering Principles

## Table of Contents
1. [Core Engineering Principles](#core-engineering-principles)
2. [SOLID Principles in Software Design](#solid-principles-in-software-design)
3. [Best Practices for Code Organization](#best-practices-for-code-organization)
4. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
5. [Decision Trees](#decision-trees)
6. [Code Review Checklist](#code-review-checklist)

---

## Core Engineering Principles

### KISS (Keep It Simple, Stupid)

**Definition:** Write simple, straightforward code that solves the problem at hand without unnecessary complexity.

**In Practice:**

✅ **Good:**
```typescript
// Simple, readable function
const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

// Or for a module
export class DateFormatter {
  static format(date: Date): string {
    return date.toLocaleDateString();
  }
}
```

❌ **Bad:**
```typescript
// Over-engineered solution
class DateFormatterFactory {
  private static instance: DateFormatterFactory;
  
  private constructor() {}
  
  static getInstance(): DateFormatterFactory {
    if (!this.instance) {
      this.instance = new DateFormatterFactory();
    }
    return this.instance;
  }
  
  createFormatter(locale: string): DateFormatter {
    return new DateFormatter(locale);
  }
}

class DateFormatter {
  constructor(private locale: string) {}
  
  format(date: Date): string {
    return date.toLocaleDateString(this.locale);
  }
}

// Usage
const formatter = DateFormatterFactory.getInstance()
  .createFormatter('fr-FR');
const formatted = formatter.format(new Date());
```

**Guidelines:**
- Prefer functions over classes when state management isn't needed
- Use built-in methods before creating custom solutions
- Question complexity: "Is there a simpler way?"

---

### YAGNI (You Aren't Gonna Need It)

**Definition:** Don't implement functionality until it's actually needed. Avoid speculative features.

**In Practice:**

✅ **Good:**
```typescript
// Only implements what's needed now
interface Item {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
}

function ItemCard({ item }: { item: Item }) {
  return (
    <div className="item-card">
      <h3>{item.name}</h3>
      <StatusBadge status={item.status} />
    </div>
  );
}
```

❌ **Bad:**
```typescript
// Speculative features "just in case"
interface Item {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  // Not needed yet
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  assignedTo?: string;
  estimatedCompletionDate?: Date;
  internalNotes?: string[];
}

function ItemCard({ 
  item, 
  // Props for features not yet requested
  onPriorityChange?: (priority: string) => void;
  onTagAdd?: (tag: string) => void;
  onAssign?: (userId: string) => void;
}: { 
  item: Item;
  onPriorityChange?: (priority: string) => void;
  onTagAdd?: (tag: string) => void;
  onAssign?: (userId: string) => void;
}) {
  // Complex logic for features that don't exist
  return <div>...</div>;
}
```

**Guidelines:**
- Implement features when they're actually requested
- Don't add configuration options "for flexibility" if there's only one use case
- Refactor when new requirements emerge, don't pre-engineer

---

### DRY (Don't Repeat Yourself)

**Definition:** Avoid duplicating logic, data, or knowledge across your codebase.

**In Practice:**

✅ **Good:**
```typescript
// Shared validation logic
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Reused in multiple modules
function handleLoginSubmit(email: string) {
  if (!validateEmail(email)) {
    setError('Invalid email');
  }
}

function handleRegisterSubmit(email: string) {
  if (!validateEmail(email)) {
    setError('Invalid email');
  }
}
```

❌ **Bad:**
```typescript
// Duplicated validation logic in different modules
function handleLoginSubmit(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError('Invalid email');
  }
}

function handleRegisterSubmit(email: string) {
  // Same regex, different variable name
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_PATTERN.test(email)) {
    setError('Invalid email'); // Same error message
  }
}
```

**Balance with Over-Abstraction:**
```typescript
// ⚠️ Too DRY - premature abstraction
const createValidator = (pattern: RegExp, errorMessage: string) => {
  return (value: string) => {
    if (!pattern.test(value)) {
      throw new Error(errorMessage);
    }
  };
};

// ✅ Good balance - extract when pattern emerges 3+ times
// Keep it simple for 1-2 occurrences
```

---

### Fail-Fast vs Fail-Safe

**Fail-Fast:** Detect and report errors immediately to prevent silent failures.

✅ **Good (Fail-Fast):**
```typescript
interface Item {
  id: string;
  name: string;
}

function processItem(item: Item | null): void {
  if (!item) {
    throw new Error('Item cannot be null');
  }
  
  if (!item.id) {
    throw new Error('Item must have an ID');
  }
  
  // Process with confidence
  saveItem(item);
}
```

❌ **Bad (Silent Failure):**
```typescript
function processItem(item: Item | null): void {
  // Silently returns, error goes unnoticed
  if (!item) return;
  if (!item.id) return;
  
  saveItem(item);
}
```

**Fail-Safe:** Gracefully handle errors to maintain system stability.

✅ **Good (Fail-Safe):**
```typescript
function fetchItems(): Promise<Item[]> {
  return fetchItemsFromStorage()
    .catch(err => {
      console.error('Fetch error:', err);
      return []; // Return empty list instead of crashing
    });
}
```

**When to Use:**
- **Fail-Fast:** Data validation, internal APIs, development environments
- **Fail-Safe:** User-facing features, production environments, network requests

---

### Design by Contract (DbC)

**Definition:** Define clear preconditions, postconditions, and invariants for functions and components.

**In Practice:**

✅ **Good:**
```typescript
/**
 * Filters items by status
 * 
 * @precondition items array must not be null
 * @precondition status must be a valid ItemStatus
 * @postcondition returns array of items matching status
 * @postcondition returned array length <= input array length
 */
function filterByStatus(
  items: Item[],
  status: ItemStatus
): Item[] {
  if (!Array.isArray(items)) {
    throw new Error('items must be an array');
  }
  
  const validStatuses: ItemStatus[] = ['pending', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
  
  return items.filter(item => item.status === status);
}
```

**Contract Enforcement:**
```typescript
// Use TypeScript's type system as contracts
interface ItemRepository {
  // Contract: must return all items or throw
  getAll(): Promise<Item[]>;
  
  // Contract: ID must exist or throws
  getById(id: string): Promise<Item>;
  
  // Contract: returns new item with generated ID
  create(data: Omit<Item, 'id'>): Promise<Item>;
}
```

---

## SOLID Principles in Software Design

These principles apply to any programming paradigm, not just React/UI development.

### Single Responsibility Principle (SRP)

**Definition:** Each component, hook, or function should have one reason to change.

✅ **Good:**
```typescript
// Single responsibility: display item data
function ItemDisplay({ item }: { item: Item }) {
  return (
    <div>
      <h2>{item.name}</h2>
      <p>{item.description}</p>
    </div>
  );
}

// Single responsibility: fetch item data
function useItem(id: string) {
  const [item, setItem] = useState<Item | null>(null);
  
  useEffect(() => {
    fetchItem(id).then(setItem);
  }, [id]);
  
  return item;
}

// Single responsibility: orchestrate
function ItemPage({ id }: { id: string }) {
  const item = useItem(id);
  
  if (!item) return <Loading />;
  
  return <ItemDisplay item={item} />;
}
```

❌ **Bad:**
```typescript
// Multiple responsibilities: fetching, displaying, editing, validating
function ItemComponent({ id }: { id: string }) {
  const [item, setItem] = useState<Item | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    fetch(`/api/items/${id}`)
      .then(res => res.json())
      .then(setItem);
  }, [id]);
  
  const validate = (data: Item) => {
    const newErrors: Record<string, string> = {};
    if (!data.name) newErrors.name = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = async () => {
    if (!item) return;
    if (!validate(item)) return;
    await fetch(`/api/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item)
    });
  };
  
  // 200+ lines of mixed concerns...
  return <div>...</div>;
}
```

---

### Open/Closed Principle (OCP)

**Definition:** Components should be open for extension but closed for modification.

✅ **Good:**
```typescript
// Base interface closed for modification
interface ButtonProps {
  onClick: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

function Button({ 
  onClick, 
  label, 
  variant = 'primary' 
}: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
}

// Extended via composition, not modification
function SubmitButton({ onSubmit }: { onSubmit: () => void }) {
  return (
    <Button onClick={onSubmit} label="Submit" variant="primary" />
  );
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false);
  
  return (
    <>
      <Button onClick={() => setShowConfirm(true)} label="Delete" variant="danger" />
      {showConfirm && <ConfirmDialog onConfirm={onDelete} />}
    </>
  );
}
```

❌ **Bad:**
```typescript
// Modification required for each new variant
function Button({
  onClick,
  label,
  isSubmit,
  isDelete,
  showConfirm,
}: {
  onClick: () => void;
  label: string;
  isSubmit?: boolean;
  isDelete?: boolean;
  showConfirm?: boolean;
}) {
  const [confirm, setConfirm] = useState(false);
  
  const handleClick = () => {
    if (showConfirm && !confirm) {
      setConfirm(true);
      return;
    }
    onClick();
  };
  
  let className = 'btn';
  if (isSubmit) className += ' btn-primary';
  if (isDelete) className += ' btn-danger';
  
  // Gets more complex with each new requirement
  return <button onClick={handleClick} className={className}>{label}</button>;
}
```

---

### Liskov Substitution Principle (LSP)

**Definition:** Subtypes must be substitutable for their base types without breaking functionality.

✅ **Good:**
```typescript
// Contract that all implementations must honor
interface FormField {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function TextInput({ value, onChange, error }: FormField) {
  return (
    <div>
      <input 
        type="text" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
}

function EmailInput({ value, onChange, error }: FormField) {
  return (
    <div>
      <input 
        type="email" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
}

// Both can be used interchangeably
function Form({ FieldComponent }: { FieldComponent: React.FC<FormField> }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();
  
  return <FieldComponent value={value} onChange={setValue} error={error} />;
}
```

❌ **Bad:**
```typescript
// Breaking the contract
function TextInput({ value, onChange, error }: FormField) {
  return (
    <input 
      type="text" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
    />
  );
}

// Incompatible interface - requires additional props
function SelectInput({ 
  value, 
  onChange, 
  error,
  options // Breaking LSP - can't substitute for FormField
}: FormField & { options: string[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  );
}
```

---

### Interface Segregation Principle (ISP)

**Definition:** Don't force components to depend on props they don't use.

✅ **Good:**
```typescript
// Minimal, focused interfaces
interface DisplayProps {
  name: string;
  email: string;
}

interface EditableProps extends DisplayProps {
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
}

// Only receives what it needs
function ItemDisplay({ name, email }: DisplayProps) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}

// Only receives what it needs
function ItemEdit({ 
  name, 
  email, 
  onNameChange, 
  onEmailChange 
}: EditableProps) {
  return (
    <form>
      <input value={name} onChange={e => onNameChange(e.target.value)} />
      <input value={email} onChange={e => onEmailChange(e.target.value)} />
    </form>
  );
}
```

❌ **Bad:**
```typescript
// Fat interface - forces all consumers to know about everything
interface ItemProps {
  // Display props
  name: string;
  email: string;
  status: string;
  
  // Edit props
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  
  // Admin props
  onApprove: () => void;
  onReject: () => void;
  
  // Metadata props
  createdAt: Date;
  updatedAt: Date;
}

// Must accept all props even though it only uses 2
function ItemDisplay({ 
  name, 
  email,
  // Forced to declare but never use
  status,
  onNameChange,
  onEmailChange,
  onApprove,
  onReject,
  createdAt,
  updatedAt
}: ItemProps) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}
```

---

### Dependency Inversion Principle (DIP)

**Definition:** Depend on abstractions (interfaces), not concrete implementations.

✅ **Good:**
```typescript
// Abstract interface
interface ItemRepository {
  getAll(): Promise<Item[]>;
  getById(id: string): Promise<Item>;
  create(data: CreateItemData): Promise<Item;
}

// Function depends on abstraction, not implementation
function useItems(repository: ItemRepository) {
  const [items, setItems] = useState<Item[]>([]);
  
  useEffect(() => {
    repository.getAll().then(setItems);
  }, [repository]);
  
  return items;
}

// Concrete implementations
class ApiRepository implements ItemRepository {
  async getAll() {
    const res = await fetch('/api/items');
    return res.json();
  }
  // ...
}

class MockRepository implements ItemRepository {
  async getAll() {
    return [{ id: '1', name: 'Test' }];
  }
  // ...
}

// Easy to swap implementations
function App() {
  const repo = process.env.NODE_ENV === 'test' 
    ? new MockRepository() 
    : new ApiRepository();
    
  const items = useItems(repo);
  return <div>{/* ... */}</div>;
}
```

❌ **Bad:**
```typescript
// Tightly coupled to concrete implementation
function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  
  useEffect(() => {
    // Hard-coded dependency on fetch API
    fetch('/api/items')
      .then(res => res.json())
      .then(setItems);
  }, []);
  
  return items;
}

// Impossible to test without real API
// Impossible to switch data sources
```

---

## Best Practices for Code Organization

These principles apply to any codebase and help maintain clean, maintainable code.

### When to Extract Reusable Logic

**Extract reusable logic (hooks, utilities, helpers) when:**
1. Logic is reused in 2+ modules or components
2. Logic has its own state or side effects
3. Logic handles a specific concern (data fetching, validation, etc.)

**Decision Tree:**

```
Is this logic used in multiple places?
├─ YES → Extract to reusable module/hook
└─ NO
   └─ Does it have complex state/side effects?
      ├─ YES → Consider extracting for testability
      └─ NO → Keep inline
```

✅ **Good:**
```typescript
// Reusable utility for form field validation
function useFormField(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string>();
  
  const validate = (validator: (val: string) => string | undefined) => {
    const err = validator(value);
    setError(err);
    return !err;
  };
  
  return { value, setValue, error, validate };
}

// Used in multiple forms
function LoginForm() {
  const email = useFormField('');
  const password = useFormField('');
  // ...
}

function RegistrationForm() {
  const email = useFormField('');
  const password = useFormField('');
  const confirmPassword = useFormField('');
  // ...
}
```

❌ **Bad:**
```typescript
// Over-extraction for single use
function useButtonClick(onClick: () => void) {
  return { handleClick: onClick };
};

// Just use onClick directly!
function MyComponent() {
  const { handleClick } = useButtonClick(() => console.log('clicked'));
  return <button onClick={handleClick}>Click</button>;
}
```

---

### Data Passing Patterns

**Decision Tree:**

```
How many levels deep is the data needed?
├─ 1-2 levels → Direct passing is fine
├─ 3-4 levels → Consider component/service composition
└─ 5+ levels or cross-cutting concern → Use shared state/context

Is the data needed globally across the entire app?
├─ YES → Use global state management
└─ NO → Use scoped context/state

Does data change frequently?
├─ YES → Be cautious with shared state (re-render/update cost)
└─ NO → Shared state is acceptable
```

✅ **Good (Direct Passing - Acceptable):**
```typescript
// 1-2 levels: direct passing is simple and clear
function App() {
  const user = useUser();
  return <Dashboard user={user} />;
}

function Dashboard({ user }: { user?: User }) {
  return <Header user={user} />;
}

function Header({ user }: { user?: User }) {
  return <div>Welcome, {user?.name}</div>;
}
```

✅ **Good (Scoped State - Needed):**
```typescript
// 5+ levels or cross-cutting: use scoped state
const ThemeContext = createContext<'light' | 'dark'>('light');

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  return (
    <ThemeContext.Provider value={theme}>
      <Layout>
        <Dashboard>
          <DeepNestedComponent />
        </Dashboard>
      </Layout>
    </ThemeContext.Provider>
  );
}

// Any nested component can access theme
function DeepNestedComponent() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>Content</div>;
}
```

❌ **Bad:**
```typescript
// Creating context for data passed 1-2 levels (overkill)
const UserContext = createContext<User | undefined>(undefined);

function App() {
  const user = useUser();
  
  return (
    <UserContext.Provider value={user}>
      <Header />
    </UserContext.Provider>
  );
}

function Header() {
  const user = useContext(UserContext);
  return <div>{user?.name}</div>;
}

// Just use props! It's simpler and more explicit
```

---

### Composition Patterns

✅ **Good (Composition):**
```typescript
// Flexible, composable functions/modules
function Container({ children }: { children: React.ReactNode }) {
  return <div className="container">{children}</div>;
}

function Header({ children }: { children: React.ReactNode }) {
  return <div className="header">{children}</div>;
}

function Body({ children }: { children: React.ReactNode }) {
  return <div className="body">{children}</div>;
}

// Usage: compose as needed
function Card({ item }: { item: Item }) {
  return (
    <Container>
      <Header>
        <h3>{item.name}</h3>
      </Header>
      <Body>
        <p>{item.description}</p>
      </Body>
    </Container>
  );
}
```

❌ **Bad (Configuration Hell):**
```typescript
// Too many parameters, inflexible
function Container({
  header,
  body,
  footer,
  showHeader,
  showFooter,
  headerClassName,
  bodyClassName,
}: {
  header?: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  headerClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <div className="container">
      {showHeader && (
        <div className={headerClassName}>
          {header}
        </div>
      )}
      <div className={bodyClassName}>{body}</div>
      {showFooter && <div>{footer}</div>}
    </div>
  );
}
```

---

### Performance Optimization Guidelines

**Rule: Optimize when you have evidence of performance problems, not before.**

✅ **Good (Optimize Based on Evidence):**
```typescript
// Start simple
function ItemList({ items }: { items: Item[] }) {
  return (
    <div>
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

// Profile and measure: "List re-renders on every update"
// Then optimize with memoization if needed
const ItemCard = React.memo(({ item }: { item: Item }) => {
  return <div>{item.name}</div>;
});
```

❌ **Bad (Premature Optimization):**
```typescript
// Wrapping everything in memoization from the start
function SimpleComponent({ name }: { name: string }) {
  const memoizedName = useMemo(() => name.toUpperCase(), [name]);
  const handleClick = useCallback(() => console.log(memoizedName), [memoizedName]);
  
  return <div onClick={handleClick}>{memoizedName}</div>;
}

// This is overkill for a simple component!
```

**When to Optimize:**
- List with 100+ items that re-render unnecessarily
- Expensive computations in render (detected by profiling)
- Components that re-render frequently despite no prop changes

---

## Anti-Patterns to Avoid

### God Components

❌ **Bad:**
```typescript
// 500+ line component that does everything
const ApplicationManagement = () => {
  // State management
  const [applications, setApplications] = useState<Application[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [sorting, setSorting] = useState<SortConfig>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data fetching
  useEffect(() => {
    fetch('/api/applications')
      .then(res => res.json())
      .then(setApplications);
  }, []);
  
  // Business logic
  const handleApprove = (id: string) => { /* ... */ };
  const handleReject = (id: string) => { /* ... */ };
  const handleBulkAction = () => { /* ... */ };
  
  // Filtering logic
  const filteredApplications = applications.filter(/* ... */);
  
  // Sorting logic
  const sortedApplications = filteredApplications.sort(/* ... */);
  
  // UI rendering (100+ lines)
  return (
    <div>
      {/* Filters */}
      {/* Table */}
      {/* Pagination */}
      {/* Modals */}
    </div>
  );
};
```

✅ **Good (Decomposed):**
```typescript
const ApplicationManagement = () => {
  const applications = useApplications();
  const filters = useFilters();
  const selection = useSelection();
  
  return (
    <div>
      <ApplicationFilters {...filters} />
      <ApplicationTable 
        applications={applications.filtered} 
        selection={selection}
      />
      <BulkActions selection={selection} />
    </div>
  );
};
```

---

### Prop Drilling Hell

❌ **Bad:**
```typescript
const App = ({ user, theme, locale }: Props) => (
  <Layout user={user} theme={theme} locale={locale}>
    <Dashboard user={user} theme={theme} locale={locale}>
      <Sidebar user={user} theme={theme} locale={locale}>
        <Nav user={user} theme={theme} locale={locale}>
          <UserMenu user={user} theme={theme} locale={locale} />
        </Nav>
      </Sidebar>
    </Dashboard>
  </Layout>
);
```

✅ **Good:**
```typescript
const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <UserProvider>
    <ThemeProvider>
      <LocaleProvider>
        {children}
      </LocaleProvider>
    </ThemeProvider>
  </UserProvider>
);

const App = () => (
  <AppProviders>
    <Layout>
      <Dashboard>
        <Sidebar>
          <Nav>
            <UserMenu />
          </Nav>
        </Sidebar>
      </Dashboard>
    </Layout>
  </AppProviders>
);
```

---

### Hidden Side Effects

❌ **Bad:**
```typescript
// Side effect hidden in getter
const Application = {
  get fullName() {
    // Hidden API call!
    fetch('/api/user').then(/* ... */);
    return `${this.firstName} ${this.lastName}`;
  }
};

// Side effect in render
const Component = ({ id }: { id: string }) => {
  // Fetches on every render!
  const data = fetchData(id);
  return <div>{data}</div>;
};
```

✅ **Good:**
```typescript
// Explicit side effects in useEffect
const Component = ({ id }: { id: string }) => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData(id).then(setData);
  }, [id]);
  
  return <div>{data}</div>;
};
```

---

### Magic Numbers and Strings

❌ **Bad:**
```typescript
const Component = () => {
  const [status, setStatus] = useState('pending');
  
  if (status === 'approved') { /* ... */ }
  if (status === 'rejected') { /* ... */ }
  
  setTimeout(() => {}, 3000); // What is 3000?
  
  const limit = data.slice(0, 10); // Why 10?
};
```

✅ **Good:**
```typescript
const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

const NOTIFICATION_TIMEOUT_MS = 3000;
const DEFAULT_PAGE_SIZE = 10;

const Component = () => {
  const [status, setStatus] = useState(APPLICATION_STATUS.PENDING);
  
  if (status === APPLICATION_STATUS.APPROVED) { /* ... */ }
  if (status === APPLICATION_STATUS.REJECTED) { /* ... */ }
  
  setTimeout(() => {}, NOTIFICATION_TIMEOUT_MS);
  
  const limit = data.slice(0, DEFAULT_PAGE_SIZE);
};
```

---

## Decision Trees

### Should I Create a New Component?

```
Does this UI section appear in multiple places?
├─ YES → Create component
└─ NO
   └─ Is this section >50 lines?
      ├─ YES → Consider extracting for readability
      └─ NO → Keep inline
```

### Should I Use Context or Props?

```
How many components need this data?
├─ 1-3 components in same tree → Props
├─ 4-10 components across 3+ levels → Context
└─ App-wide state → Global state management

Does data change frequently?
├─ YES (every keystroke) → Prefer props or local state
└─ NO (user session, theme) → Context is good
```

### Should I Optimize This Component?

```
Do you have performance measurements showing a problem?
├─ NO → Don't optimize yet
└─ YES
   └─ What's the issue?
      ├─ Unnecessary re-renders → React.memo
      ├─ Expensive calculation → useMemo
      ├─ Function recreation → useCallback
      └─ Large list → Virtualization
```

---

## Code Review Checklist

### Principles
- [ ] Does the code follow KISS? Could it be simpler?
- [ ] Does it implement only what's needed (YAGNI)?
- [ ] Is duplicated logic properly abstracted (DRY)?
- [ ] Are errors handled appropriately (Fail-Fast/Fail-Safe)?

### SOLID
- [ ] Does each component/hook have a single responsibility?
- [ ] Can components be extended without modification?
- [ ] Do subtypes honor their contracts (LSP)?
- [ ] Are interfaces minimal and focused (ISP)?
- [ ] Does code depend on abstractions, not concrete implementations?

### React Best Practices
- [ ] Are custom hooks justified (reuse/complexity)?
- [ ] Is Context used appropriately (not for props 1-2 levels deep)?
- [ ] Are components composed rather than configured?
- [ ] Is optimization based on measured performance issues?

### Anti-Patterns
- [ ] Are components focused (<200 lines)?
- [ ] Is prop drilling minimized (3+ levels)?
- [ ] Are side effects explicit and in useEffect?
- [ ] Are magic numbers/strings replaced with named constants?

### General
- [ ] Is the code readable and self-documenting?
- [ ] Are types properly defined?
- [ ] Are error cases handled?
- [ ] Is the code testable?

---

## Contributing to This Document

This document is living documentation. If you find patterns that work well or anti-patterns to avoid, please submit updates with concrete examples.

**Last Updated:** January 2026