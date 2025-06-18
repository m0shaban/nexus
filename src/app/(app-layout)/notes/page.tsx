'use client'

import { ProfessionalNoteTaker } from '@/components/ProfessionalNoteTaker'
import { NotesDisplay } from '@/components/NotesDisplayFixed'
import { DatabaseStatusCheck } from '@/components/DatabaseStatusCheck'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Lightbulb, Zap, Target, Clock, CheckCircle, AlertTriangle, Smartphone, Monitor } from 'lucide-react'

export default function NotesPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 rounded-3xl -z-10 opacity-60"></div>
        <div className="relative py-12 px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full text-sm font-medium text-emerald-700 mb-6">
            <FileText className="h-4 w-4" />
            أداة احترافية
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              مساحة الملاحظات
            </span>
            <span className="block text-xl md:text-2xl text-muted-foreground font-normal mt-2">
              اكتب، نظّم، حقّق
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">
            حوّل أفكارك العابرة إلى خطط منظمة وقابلة للتنفيذ مع أداة الملاحظات الذكية
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-emerald-600">∞</div>
              <div className="text-xs text-muted-foreground">ملاحظات لا محدودة</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-blue-600">AI</div>
              <div className="text-xs text-muted-foreground">معالجة ذكية</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-purple-600">2x</div>
              <div className="text-xs text-muted-foreground">طريقتا الوصول</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-xs text-muted-foreground">متاح دائماً</div>
            </div>
          </div>
        </div>      </section>

      {/* Database Status Check */}
      <DatabaseStatusCheck />

      {/* Note Taking Tool */}
      <section>
        <ProfessionalNoteTaker />
      </section>

      {/* Notes Display */}
      <section>
        <NotesDisplay />
      </section>

      {/* Features & Guide */}
      <section className="grid gap-8 md:grid-cols-2">
        {/* How it Works */}
        <Card className="border-2 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-right">
              <Target className="h-5 w-5 text-blue-600" />
              كيف تعمل الأداة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                1
              </div>
              <div className="flex-1 text-right">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  اكتب ملاحظتك
                </h3>
                <p className="text-sm text-muted-foreground">
                  اكتب أي فكرة، مهمة، أو خطة في مربع النص المتقدم مع دعم كامل للعربية
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                2
              </div>
              <div className="flex-1 text-right">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  المعالجة الذكية
                </h3>
                <p className="text-sm text-muted-foreground">
                  يتم تحليل ومعالجة ملاحظتك تلقائياً باستخدام نفس نظام التليجرام المتقدم
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                3
              </div>
              <div className="flex-1 text-right">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  الحفظ والتنظيم
                </h3>
                <p className="text-sm text-muted-foreground">
                  حفظ فوري في قاعدة البيانات مع إمكانية تحويلها إلى مشاريع ومهام منظمة
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Methods */}
        <Card className="border-2 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-right">
              <Lightbulb className="h-5 w-5 text-orange-600" />
              طرق الوصول المتعددة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <div className="absolute top-4 left-1/2 w-px h-8 bg-gradient-to-b from-blue-200 to-emerald-200 transform -translate-x-1/2"></div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">أداة الويب</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">الحالية</Badge>
                </div>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    واجهة احترافية شاملة
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    سجل مفصل للملاحظات
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    متابعة حالة المعالجة
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200 mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-semibold text-emerald-900">تليجرام بوت</h3>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">متكامل</Badge>
                </div>
                <ul className="space-y-2 text-sm text-emerald-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    إرسال سريع من الهاتف
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    ملاحظات أثناء التنقل
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    مزامنة تلقائية
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Status Indicators Guide */}
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <Clock className="h-5 w-5 text-slate-600" />
            دليل حالات الملاحظات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-white animate-spin" />
              </div>
              <div className="text-right">
                <h4 className="font-medium text-blue-900">جاري المعالجة</h4>
                <p className="text-xs text-blue-700">يتم تحليل الملاحظة حالياً</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div className="text-right">
                <h4 className="font-medium text-emerald-900">تمت المعالجة</h4>
                <p className="text-xs text-emerald-700">نجحت العملية بنجاح</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <div className="text-right">
                <h4 className="font-medium text-red-900">حدث خطأ</h4>
                <p className="text-xs text-red-700">تحقق من الاتصال والإعدادات</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips & Best Practices */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right text-amber-900">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            نصائح للاستخدام الأمثل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-amber-900 text-right">💡 نصائح الكتابة:</h4>
              <ul className="space-y-2 text-sm text-amber-800 text-right">
                <li>• اكتب بوضوح ودقة لتحصل على معالجة أفضل</li>
                <li>• استخدم الكلمات المفتاحية للموضوع الرئيسي</li>
                <li>• قسم الأفكار الطويلة إلى ملاحظات منفصلة</li>
                <li>• أضف التاريخ المطلوب إذا كانت مهمة مؤجلة</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-amber-900 text-right">⚡ نصائح الكفاءة:</h4>
              <ul className="space-y-2 text-sm text-amber-800 text-right">
                <li>• استخدم الويب للملاحظات المفصلة</li>
                <li>• استخدم التليجرام للأفكار السريعة</li>
                <li>• راجع السجل دورياً لمتابعة التقدم</li>
                <li>• حول الملاحظات المهمة إلى مشاريع</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
