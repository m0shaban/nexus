# 🤝 دليل المساهمة في NEXUS

شكراً لاهتمامك بالمساهمة في مشروع NEXUS! نحن نرحب بجميع أنواع المساهمات من المطورين والمصممين والمختبرين والكتّاب.

## 📋 جدول المحتويات

- [🎯 كيفية المساهمة](#how-to-contribute)
- [🐛 الإبلاغ عن الأخطاء](#bug-reports)
- [💡 اقتراح الميزات](#feature-requests)
- [💻 المساهمة في الكود](#code-contributions)
- [📝 معايير الكود](#coding-standards)
- [🧪 كتابة الاختبارات](#testing)
- [📚 تحديث التوثيق](#documentation)
- [📞 التواصل](#communication)

## 🎯 كيفية المساهمة {#how-to-contribute}

### أنواع المساهمات المرحب بها:

- **🐛 إصلاح الأخطاء** - حل المشاكل التقنية
- **✨ ميزات جديدة** - إضافة وظائف جديدة
- **📖 تحسين التوثيق** - كتابة وتحديث الدلائل
- **🎨 تحسين التصميم** - تطوير واجهة المستخدم
- **🧪 كتابة الاختبارات** - زيادة تغطية الاختبارات
- **🌐 الترجمة** - إضافة دعم لغات جديدة
- **⚡ تحسين الأداء** - تسريع التطبيق

## 🐛 الإبلاغ عن الأخطاء {#bug-reports}

### قبل الإبلاغ عن خطأ:

1. **ابحث في Issues الموجودة** للتأكد من عدم وجود بلاغ مشابه
2. **تحقق من أحدث إصدار** - قد يكون الخطأ مُصحح بالفعل
3. **اجمع المعلومات المطلوبة** لتسهيل عملية الإصلاح

### تقرير الخطأ المثالي:

```markdown
## 🐛 وصف الخطأ
وصف واضح ومختصر للمشكلة.

## 🔄 خطوات إعادة الإنتاج
1. اذهب إلى '...'
2. اضغط على '...'
3. مرّر إلى أسفل إلى '...'
4. شاهد الخطأ

## ✅ السلوك المتوقع
وصف لما كان يجب أن يحدث.

## 🖥️ لقطات الشاشة
إضافة لقطات شاشة لتوضيح المشكلة.

## 🔧 البيئة التقنية
- OS: [e.g. Windows 11, macOS, Ubuntu]
- Browser: [e.g. Chrome 120, Firefox 119]
- Version: [e.g. v1.0.0]
- Node.js: [e.g. v18.17.0]

## 📋 معلومات إضافية
أي معلومات أخرى مفيدة حول المشكلة.
```

### تسميات الأخطاء:

- `bug` - خطأ مؤكد
- `critical` - خطأ يمنع استخدام التطبيق
- `ui/ux` - مشكلة في الواجهة
- `performance` - مشكلة في الأداء
- `security` - مشكلة أمنية

## 💡 اقتراح الميزات {#feature-requests}

### قبل اقتراح ميزة جديدة:

1. **ابحث في Issues** للتأكد من عدم وجود اقتراح مشابه
2. **فكر في الحاجة الفعلية** - هل هذه الميزة مفيدة للمستخدمين؟
3. **اعتبر التعقيد** - هل الميزة تستحق التطوير والصيانة؟

### طلب الميزة المثالي:

```markdown
## 🚀 اقتراح الميزة

### 🎯 المشكلة المُحلولة
وصف المشكلة التي تحلها هذه الميزة.

### 💡 الحل المقترح
وصف تفصيلي للميزة الجديدة.

### 🎨 تصميم الواجهة (اختياري)
mockups أو sketches للواجهة الجديدة.

### 🤔 البدائل المعتبرة
حلول أخرى فكرت فيها.

### 📊 تأثير المستخدمين
كيف ستؤثر هذه الميزة على تجربة المستخدم؟

### 🔧 التحديات التقنية
ما هي التحديات المتوقعة في التطوير؟
```

### تسميات الميزات:

- `enhancement` - تحسين للميزات الموجودة
- `feature` - ميزة جديدة كاملة
- `ui/ux` - تحسين الواجهة
- `breaking-change` - تغيير قد يكسر التوافق
- `good-first-issue` - مناسب للمساهمين الجدد

## 💻 المساهمة في الكود {#code-contributions}

### تدفق العمل (Workflow):

1. **Fork المشروع** إلى حسابك
2. **إنشاء branch جديد** للميزة أو الإصلاح
3. **تطوير وتجريب** التغييرات محلياً
4. **كتابة اختبارات** للكود الجديد
5. **التأكد من تمرير جميع الاختبارات**
6. **Commit التغييرات** مع رسائل واضحة
7. **Push إلى branch** في مستودعك
8. **فتح Pull Request** مع وصف مفصل

### إعداد بيئة التطوير:

```bash
# 1. استنساخ المشروع
git clone https://github.com/your-username/nexus.git
cd nexus

# 2. تثبيت التبعيات
npm install

# 3. إعداد متغيرات البيئة
cp .env.example .env.local
# عدّل .env.local مع بياناتك

# 4. إعداد قاعدة البيانات
npm run db:setup

# 5. تشغيل الاختبارات
npm test

# 6. تشغيل الخادم
npm run dev
```

### تسمية الـ Branches:

- `feature/feature-name` - للميزات الجديدة
- `fix/bug-description` - لإصلاح الأخطاء
- `docs/update-readme` - لتحديث التوثيق
- `refactor/component-name` - لإعادة هيكلة الكود
- `test/add-unit-tests` - لإضافة اختبارات

### رسائل الـ Commit:

استخدم الصيغة التالية:

```
type(scope): description

[optional body]

[optional footer]
```

**الأنواع المتاحة:**
- `feat` - ميزة جديدة
- `fix` - إصلاح خطأ
- `docs` - تحديث التوثيق
- `style` - تنسيق الكود (بدون تغيير الوظائف)
- `refactor` - إعادة هيكلة الكود
- `test` - إضافة اختبارات
- `chore` - صيانة عامة

**أمثلة:**
```bash
feat(chat): add voice message support
fix(auth): resolve login redirect issue
docs(readme): update installation guide
test(api): add unit tests for notes endpoint
```

## 📝 معايير الكود {#coding-standards}

### 🎯 المبادئ العامة:

1. **البساطة** - اكتب كود بسيط وواضح
2. **القابلية للقراءة** - اجعل الكود قابل للفهم
3. **الاتساق** - اتبع نمط الكود الموجود
4. **الأداء** - اعتبر الأداء في التصميم
5. **الأمان** - تأكد من أمان الكود

### 📁 هيكل الملفات:

```
src/
├── app/                    # Next.js App Router
│   ├── (app-layout)/      # Layout groups
│   ├── api/               # API endpoints
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components
│   └── features/         # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── types/                # TypeScript definitions
└── utils/                # Helper functions
```

### 🎨 TypeScript Guidelines:

```typescript
// ✅ استخدم interfaces للـ props
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  onClick?: () => void
}

// ✅ استخدم const assertions للثوابت
const THEMES = ['light', 'dark'] as const
type Theme = typeof THEMES[number]

// ✅ استخدم generic types عند الحاجة
interface ApiResponse<T> {
  data: T
  status: 'success' | 'error'
  message?: string
}

// ❌ تجنب any
const data: any = getData() // ❌
const data: User = getData() // ✅
```

### 🎨 React Guidelines:

```tsx
// ✅ استخدم functional components
const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary',
  disabled = false,
  onClick 
}) => {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md',
        variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// ✅ استخدم custom hooks للمنطق المُعاد
const useCounter = (initialValue = 0) => {
  const [count, setCount] = useState(initialValue)
  
  const increment = useCallback(() => {
    setCount(prev => prev + 1)
  }, [])
  
  const decrement = useCallback(() => {
    setCount(prev => prev - 1)
  }, [])
  
  return { count, increment, decrement }
}
```

### 🎨 CSS/Tailwind Guidelines:

```tsx
// ✅ استخدم cn helper للشروطية
import { cn } from '@/lib/utils'

const className = cn(
  'base-classes',
  variant === 'large' && 'text-lg',
  isActive && 'bg-blue-500',
  disabled && 'opacity-50'
)

// ✅ نظم الكلاسات حسب الوظيفة
<div className={cn(
  // Layout
  'flex items-center justify-between',
  // Spacing
  'p-4 m-2',
  // Appearance
  'bg-white rounded-lg shadow-md',
  // States
  'hover:shadow-lg transition-shadow'
)}>
```

## 🧪 كتابة الاختبارات {#testing}

### أنواع الاختبارات:

1. **Unit Tests** - لاختبار المكونات المفردة
2. **Integration Tests** - لاختبار التكامل بين المكونات
3. **E2E Tests** - لاختبار سيناريوهات المستخدم الكاملة

### كتابة اختبار للمكونات:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByText('Click me')).toBeDisabled()
  })
})
```

### اختبار API Endpoints:

```typescript
import { POST } from '@/app/api/notes/route'
import { NextRequest } from 'next/server'

describe('/api/notes', () => {
  it('creates a new note', async () => {
    const request = new NextRequest('http://localhost:3000/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Note',
        content: 'Test content'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.note.title).toBe('Test Note')
  })
})
```

### تشغيل الاختبارات:

```bash
# جميع الاختبارات
npm test

# اختبارات مع المراقبة
npm run test:watch

# تقرير التغطية
npm run test:coverage

# اختبارات محددة
npm test -- Button.test.tsx
```

## 📚 تحديث التوثيق {#documentation}

### أنواع التوثيق:

1. **README** - دليل البدء السريع
2. **API Docs** - توثيق الـ endpoints
3. **Component Docs** - توثيق المكونات
4. **User Guides** - أدلة المستخدم
5. **Developer Guides** - أدلة المطور

### معايير التوثيق:

- **الوضوح** - اكتب بلغة بسيطة ومفهومة
- **الأمثلة** - قدم أمثلة عملية
- **التحديث** - حافظ على التوثيق محدث
- **التنظيم** - نظم المعلومات منطقياً

### توثيق المكونات:

```tsx
/**
 * Button Component
 * 
 * A reusable button component with multiple variants and states.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onClick={() => alert('Clicked!')}>
 *   Click Me
 * </Button>
 * ```
 * 
 * @param children - The content to display inside the button
 * @param variant - The visual style variant
 * @param disabled - Whether the button is disabled
 * @param onClick - Function to call when button is clicked
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  disabled = false,
  onClick
}) => {
  // Component implementation
}
```

## 📞 التواصل {#communication}

### قنوات التواصل:

- **GitHub Issues** - للمشاكل والاقتراحات
- **GitHub Discussions** - للنقاشات العامة
- **Email** - للأمور الحساسة: contribute@nexus.dev
- **Discord** - للدردشة المباشرة: [دعوة Discord](#)

### آداب التواصل:

1. **الاحترام** - تواصل بأدب مع جميع المساهمين
2. **الوضوح** - اجعل رسائلك واضحة ومحددة
3. **الصبر** - انتظر الرد بصبر، المطورون متطوعون
4. **المساعدة** - ساعد المطورين الجدد
5. **البناء** - قدم نقد بناء وحلول مقترحة

### الأسئلة الشائعة:

**س: كم من الوقت يستغرق مراجعة Pull Request؟**
ج: عادة 2-5 أيام عمل، حسب حجم التغيير.

**س: هل يمكنني العمل على issue مُخصص لشخص آخر؟**
ج: لا، إلا إذا لم يتم التقدم فيه لأكثر من أسبوعين.

**س: كيف أصبح maintainer للمشروع؟**
ج: بالمساهمة المستمرة والجودة العالية لفترة طويلة.

## 🙏 شكراً لك!

شكراً لك على اهتمامك بالمساهمة في NEXUS. مساهمتك، مهما كان حجمها، تساعد في تحسين التطبيق لجميع المستخدمين.

**مساهماتك الأولى:**

إذا كانت هذه مساهمتك الأولى، ابحث عن issues مع تسمية `good-first-issue` - هذه قضايا مناسبة للمبتدئين.

**تحتاج مساعدة؟**

لا تتردد في طرح الأسئلة في GitHub Discussions أو التواصل معنا مباشرة.

---

🌟 **معاً نبني أداة إنتاجية أفضل للجميع!** 🌟
