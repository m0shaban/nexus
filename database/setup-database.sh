#!/bin/bash

# ========================================
# setup-database.sh
# سكريپت Bash لإعداد قاعدة البيانات
# ========================================

set -e

# الألوان للنصوص
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# دالة لطباعة النصوص الملونة
print_colored() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# دالة لقراءة متغيرات البيئة
load_env() {
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
        print_colored $GREEN "✅ تم تحميل متغيرات البيئة من .env"
        return 0
    else
        print_colored $YELLOW "⚠️  ملف .env غير موجود، يرجى إنشاؤه أولاً"
        print_colored $YELLOW "يمكنك نسخ .env.example إلى .env وتعديل القيم"
        return 1
    fi
}

# دالة لاختبار الاتصال بـ Supabase
test_supabase_connection() {
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        print_colored $RED "❌ معلومات Supabase غير مكتملة في ملف .env"
        return 1
    fi
    
    print_colored $CYAN "🔗 اختبار الاتصال بـ Supabase..."
    
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/")
    
    if [ "$response" -eq 200 ]; then
        print_colored $GREEN "✅ تم الاتصال بـ Supabase بنجاح"
        return 0
    else
        print_colored $RED "❌ فشل في الاتصال بـ Supabase (HTTP: $response)"
        return 1
    fi
}

# دالة لتشغيل سكريپت SQL
run_sql_script() {
    local script_path=$1
    local description=$2
    
    if [ ! -f "$script_path" ]; then
        print_colored $RED "❌ الملف غير موجود: $script_path"
        return 1
    fi
    
    print_colored $CYAN "📄 تشغيل: $description"
    
    # قراءة محتوى الملف
    local sql_content=$(cat "$script_path")
    
    # إرسال SQL إلى Supabase
    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/sql" \
        -d "$sql_content" \
        "$NEXT_PUBLIC_SUPABASE_URL/sql" \
        -o /tmp/sql_response.json)
    
    if [ "$response" -eq 200 ] || [ "$response" -eq 201 ]; then
        print_colored $GREEN "✅ $description - تم بنجاح"
        return 0
    else
        print_colored $RED "❌ خطأ في $description (HTTP: $response)"
        if [ -f /tmp/sql_response.json ]; then
            print_colored $RED "التفاصيل: $(cat /tmp/sql_response.json)"
        fi
        return 1
    fi
}

# دالة الإعداد الكامل
setup_database() {
    print_colored $CYAN "🔧 بدء إعداد قاعدة البيانات الكاملة..."
    
    declare -a scripts=(
        "db/01-setup-extensions.sql:إعداد الإضافات والدوال المساعدة"
        "db/02-create-users-new.sql:إنشاء نظام المستخدمين"
        "db/03-create-notes.sql:إنشاء نظام الملاحظات"
        "db/04-create-projects-new.sql:إنشاء نظام المشاريع والمهام"
        "db/05-create-scenarios.sql:إنشاء نظام السيناريوهات"
        "db/06-create-streaks.sql:إنشاء نظام السلاسل"
        "db/07-create-mirror.sql:إنشاء نظام المرآة"
        "db/08-create-logos.sql:إنشاء نظام الشعارات"
        "db/09-create-analytics-views.sql:إنشاء واجهات التحليل"
        "db/10-create-sample-data.sql:إنشاء البيانات التجريبية"
    )
    
    local success_count=0
    local total_count=${#scripts[@]}
    
    for script_info in "${scripts[@]}"; do
        local script_path="${script_info%%:*}"
        local description="${script_info##*:}"
        
        if run_sql_script "$script_path" "$description"; then
            ((success_count++))
        fi
        sleep 1
    done
    
    print_colored $PURPLE "=========================================="
    if [ $success_count -eq $total_count ]; then
        print_colored $GREEN "🎉 تم إعداد قاعدة البيانات بنجاح!"
        print_colored $GREEN "✅ تم إنشاء $success_count من $total_count مكونات"
    else
        print_colored $YELLOW "⚠️  تم إعداد $success_count من $total_count مكونات"
    fi
    print_colored $PURPLE "=========================================="
}

# دالة إعادة التعيين
reset_database() {
    print_colored $YELLOW "🔄 إعادة تعيين قاعدة البيانات..."
    print_colored $RED "⚠️  سيتم حذف جميع البيانات!"
    
    read -p "هل أنت متأكد؟ اكتب 'yes' للمتابعة: " confirmation
    if [ "$confirmation" = "yes" ]; then
        # تشغيل سكريپت الحذف إذا كان موجوداً
        if [ -f "db/00-drop-all-tables.sql" ]; then
            run_sql_script "db/00-drop-all-tables.sql" "حذف جميع الجداول"
        fi
        
        # إعادة تشغيل الإعداد
        setup_database
    else
        print_colored $RED "❌ تم إلغاء العملية"
    fi
}

# دالة إضافة البيانات التجريبية
add_sample_data() {
    print_colored $CYAN "🧪 إضافة البيانات التجريبية فقط..."
    run_sql_script "db/10-create-sample-data.sql" "إنشاء البيانات التجريبية"
}

# دالة المساعدة
show_help() {
    echo "الاستخدام: $0 [ACTION]"
    echo ""
    echo "الإجراءات المتاحة:"
    echo "  setup    - إعداد كامل لقاعدة البيانات (افتراضي)"
    echo "  reset    - إعادة تعيين قاعدة البيانات (حذف وإعادة إنشاء)"
    echo "  sample   - إضافة البيانات التجريبية فقط"
    echo "  help     - عرض هذه المساعدة"
    echo ""
    echo "أمثلة:"
    echo "  $0                    # إعداد كامل"
    echo "  $0 setup             # إعداد كامل"
    echo "  $0 reset             # إعادة تعيين"
    echo "  $0 sample            # بيانات تجريبية فقط"
}

# الدالة الرئيسية
main() {
    clear
    
    print_colored $PURPLE "=========================================="
    print_colored $PURPLE "🚀 إعداد قاعدة بيانات Nexus"
    print_colored $PURPLE "=========================================="
    
    # قراءة متغيرات البيئة
    if ! load_env; then
        exit 1
    fi
    
    # اختبار الاتصال
    if ! test_supabase_connection; then
        exit 1
    fi
    
    local action=${1:-setup}
    
    case $action in
        "setup")
            setup_database
            ;;
        "reset")
            reset_database
            ;;
        "sample")
            add_sample_data
            ;;
        "help"|"-h"|"--help")
            show_help
            exit 0
            ;;
        *)
            print_colored $RED "❌ إجراء غير صحيح: $action"
            show_help
            exit 1
            ;;
    esac
    
    print_colored $PURPLE "=========================================="
    print_colored $CYAN "📖 للبدء في الاستخدام:"
    print_colored $WHITE "1. تشغيل التطبيق: npm run dev"
    print_colored $WHITE "2. فتح المتصفح: http://localhost:3000"
    print_colored $WHITE "3. المستخدم التجريبي: test@nexus.app"
    print_colored $PURPLE "=========================================="
}

# التحقق من وجود curl
if ! command -v curl &> /dev/null; then
    print_colored $RED "❌ curl غير مثبت. يرجى تثبيته أولاً."
    exit 1
fi

# تشغيل الدالة الرئيسية
main "$@"
